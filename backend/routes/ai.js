const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../config/database");
const fs = require("fs");
const pdf = require("pdf-parse");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

async function extractTextFromPDF(filePath) {
  try {
    if (!fs.existsSync(filePath)) return "";
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text || "";
  } catch (err) {
    console.error("PDF error:", err);
    return "";
  }
}

function getModel() {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
}

router.get("/cached-summary/:id", async (req, res) => {
  try {
    const resourceId = req.params.id;

    const [resources] = await db.query(
      `SELECT r.*, 
        u2.fullName AS studentName,
        u3.fullName AS supervisorName,
        rm.year, rm.course
      FROM resources r
      LEFT JOIN users u2 ON r.studentId = u2.id
      LEFT JOIN users u3 ON r.supervisorId = u3.id
      LEFT JOIN resource_metadata rm ON r.id = rm.resourceId
      WHERE r.id = ? AND r.status='approved'`,
      [resourceId],
    );

    if (!resources.length) {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }

    const r = resources[0];

    let documentText = "";
    if (r.filePath?.endsWith(".pdf")) {
      documentText = await extractTextFromPDF(r.filePath);
      documentText = documentText.slice(0, 8000);
    }

    const prompt = `
You are a professional academic assistant.
Summarize this project clearly, professionally, and concisely.

Title: ${r.title}
Type: ${r.type}
Department: ${r.department}
Student: ${r.studentName || ""}
Supervisor: ${r.supervisorName || ""}
Year: ${r.year || ""}
Course: ${r.course || ""}

Description:
${r.description}

Document:
${documentText}
`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({ success: true, summary: text });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({
      success: false,
      message: "AI generation failed. Please try again later.",
    });
  }
});

module.exports = router;
