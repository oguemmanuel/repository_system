const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../config/database");
const { isAuthenticated } = require("../middleware/auth");
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error("PDF file not found:", filePath);
      return "";
    }
    
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text || "";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "";
  }
}

// Cache AI summaries to improve performance
const summaryCache = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Get or generate summary with caching
router.get("/cached-summary/:id", async (req, res) => {
  try {
    const resourceId = req.params.id;
    
    // Check if we have a cached summary that's not expired
    const cachedData = summaryCache.get(resourceId);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_EXPIRY)) {
      return res.status(200).json({
        success: true,
        resource: cachedData.resource,
        summary: cachedData.summary,
        fromCache: true,
      });
    }

    // Get resource details
    const [resources] = await db.query(
      `SELECT r.*,   
        u1.fullName AS uploadedByName,
        u2.fullName AS studentName,
        u2.department AS studentDepartment,
        u3.fullName AS supervisorName,
        rm.year, rm.semester, rm.course, rm.tags
      FROM resources r  
      LEFT JOIN users u1 ON r.uploadedBy = u1.id  
      LEFT JOIN users u2 ON r.studentId = u2.id  
      LEFT JOIN users u3 ON r.supervisorId = u3.id  
      LEFT JOIN resource_metadata rm ON r.id = rm.resourceId  
      WHERE r.id = ? AND r.status = 'approved'`,
      [resourceId]
    );

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found or not approved",
      });
    }

    const resource = resources[0];
    
    // Extract text from PDF if available
    let documentText = "";
    if (resource.filePath && resource.filePath.toLowerCase().endsWith('.pdf')) {
      documentText = await extractTextFromPDF(resource.filePath);
      
      // Limit document text to avoid exceeding model context limits
      if (documentText.length > 10000) {
        documentText = documentText.substring(0, 10000) + "...";
      }
    }
    
    // Create a prompt for the AI model
    const prompt = `
      Please summarize the following academic project:
      
      Title: ${resource.title}
      Type: ${resource.type}
      Department: ${resource.department}
      ${resource.studentName ? `Student: ${resource.studentName}` : ''}
      ${resource.supervisorName ? `Supervisor: ${resource.supervisorName}` : ''}
      ${resource.course ? `Course: ${resource.course}` : ''}
      ${resource.year ? `Year: ${resource.year}` : ''}
      
      Description:
      ${resource.description}
      
      ${documentText ? `Document Content (excerpt):
      ${documentText}` : ''}
      
      Please provide a concise summary (about 2-3 paragraphs) that explains the main purpose, 
      methodology, and potential applications of this project. Focus on the most important aspects
      that would help someone decide if they want to explore this project further.
    `;

    // Generate content using Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // Cache the result
    const resourceData = {
      id: resource.id,
      title: resource.title,
      type: resource.type,
      department: resource.department,
      studentName: resource.studentName,
      supervisorName: resource.supervisorName,
    };
    
    summaryCache.set(resourceId, {
      resource: resourceData,
      summary,
      timestamp: Date.now(),
    });

    // Log this summarization request
    if (req.session && req.session.user) {
      await db.query(
        "INSERT INTO resource_access_logs (resourceId, userId, action, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?)",
        [resourceId, req.session.user.id, "ai_summarize", req.ip, req.headers["user-agent"]]
      );
    }

    res.status(200).json({
      success: true,
      resource: resourceData,
      summary,
      fromCache: false,
    });
  } catch (error) {
    console.error("Error generating AI summary:", error);
    res.status(500).json({
      success: false,
      message: "Error generating AI summary",
      error: error.message,
    });
  }
});

module.exports = router;