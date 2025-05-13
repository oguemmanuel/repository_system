const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const db = require("../config/database")
const { isAuthenticated, isAuthorized, isSupervisorOrAdmin, isAdmin } = require("../middleware/auth")
const { validateResourceUpload, validateResourceAction } = require("../middleware/validators")
const { sendResourceApprovalNotification } = require("../utils/emailService")

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/resources"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip"]
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, and ZIP files are allowed."))
    }
  },
})


// Approve a resource (admin or supervisor)
router.put("/approve/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const resourceId = req.params.id
    const userId = req.session.user.id
    const userRole = req.session.user.role

    // Check if user has permission to approve (admin or supervisor)
    if (userRole !== "admin" && userRole !== "supervisor") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to approve resources",
      })
    }

    // For supervisors, check if they are assigned to this resource
    if (userRole === "supervisor") {
      const [supervisorResources] = await db.query("SELECT * FROM resources WHERE id = ? AND supervisorId = ?", [
        resourceId,
        userId,
      ])

      if (supervisorResources.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You can only approve resources assigned to you",
        })
      }
    }

    // Update resource status to approved
    const [updateResult] = await db.query(
      'UPDATE resources SET status = "approved", approvedAt = NOW(), approvedBy = ? WHERE id = ?',
      [userId, resourceId],
    )

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    // Get the resource details for the notification
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
      WHERE r.id = ?`,
      [resourceId],
    )

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    const resource = resources[0]

    // Send notification emails to all users
    try {
      console.log("Attempting to send approval notifications for resource:", resourceId)
      const notificationResult = await sendResourceApprovalNotification(resource)
      console.log("Notification result:", notificationResult)
    } catch (emailError) {
      console.error("Failed to send resource approval notifications:", emailError)
      // Continue with approval even if email fails
    }

    res.status(200).json({
      success: true,
      message: "Resource approved successfully and users notified",
      resource: {
        id: resource.id,
        title: resource.title,
        type: resource.type,
        status: "approved",
      },
    })
  } catch (error) {
    console.error("Error approving resource:", error)
    res.status(500).json({
      success: false,
      message: "Failed to approve resource",
      error: error.message,
    })
  }
})

// Get all resources with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, type, department, search, status, supervisorId, studentId, course } = req.query
    const offset = (page - 1) * limit

    let query = `  
      SELECT r.*,   
        u1.fullName AS uploadedByName,   
        u2.fullName AS studentName,   
        u3.fullName AS supervisorName,  
        rm.year, rm.semester, rm.course, rm.tags  
      FROM resources r  
      LEFT JOIN users u1 ON r.uploadedBy = u1.id  
      LEFT JOIN users u2 ON r.studentId = u2.id  
      LEFT JOIN users u3 ON r.supervisorId = u3.id  
      LEFT JOIN resource_metadata rm ON r.id = rm.resourceId  
      WHERE 1=1  
    `

    const queryParams = []

    // Add filters
    if (type) {
      query += " AND r.type = ?"
      queryParams.push(type)
    }

    if (department) {
      query += " AND r.department = ?"
      queryParams.push(department)
    }

    if (search) {
      query +=
        " AND (r.title LIKE ? OR r.description LIKE ? OR u1.fullName LIKE ? OR u2.fullName LIKE ? OR u3.fullName LIKE ? OR rm.course LIKE ?)"
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (status) {
      query += " AND r.status = ?"
      queryParams.push(status)
    }

    if (supervisorId) {
      query += " AND r.supervisorId = ?"
      queryParams.push(supervisorId)
    }

    if (studentId) {
      query += " AND r.studentId = ?"
      queryParams.push(studentId)
    }

    if (course) {
      query += " AND rm.course LIKE ?"
      queryParams.push(`%${course}%`)
    }

    // Add status filter for non-admin users
    if (req.session && req.session.user && req.session.user.role !== "admin") {
      // Students can only see approved resources or their own uploads
      if (req.session.user.role === "student") {
        query += ' AND (r.status = "approved" OR r.uploadedBy = ?)'
        queryParams.push(req.session.user.id)
      }
      // Supervisors can see approved resources, their own uploads, and resources assigned to them
      else if (req.session.user.role === "supervisor") {
        query += ' AND (r.status = "approved" OR r.uploadedBy = ? OR r.supervisorId = ?)'
        queryParams.push(req.session.user.id, req.session.user.id)
      }
    }

    // Count total resources for pagination
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as filtered`, queryParams)
    const totalResources = countResult[0].total

    // Add pagination
    query += " ORDER BY r.createdAt DESC LIMIT ? OFFSET ?"
    queryParams.push(Number.parseInt(limit), Number.parseInt(offset))

    // Execute query
    const [resources] = await db.query(query, queryParams)

    res.status(200).json({
      success: true,
      count: resources.length,
      total: totalResources,
      totalPages: Math.ceil(totalResources / limit),
      currentPage: Number.parseInt(page),
      resources,
    })
  } catch (error) {
    console.error("Error fetching resources:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching resources",
      error: error.message,
    })
  }
})

// Get public resources (no authentication required)
router.get("/public", async (req, res) => {
  try {
    const { page = 1, limit = 10, type, department, search, course } = req.query
    const offset = (page - 1) * limit

    let query = ` 
      SELECT r.*,   
        u1.fullName AS uploadedByName,   
        u2.fullName AS studentName,   
        u3.fullName AS supervisorName,  
        rm.year, rm.semester, rm.course, rm.tags  
      FROM resources r  
      LEFT JOIN users u1 ON r.uploadedBy = u1.id  
      LEFT JOIN users u2 ON r.studentId = u2.id  
      LEFT JOIN users u3 ON r.supervisorId = u3.id  
      LEFT JOIN resource_metadata rm ON r.id = rm.resourceId  
      WHERE r.status = 'approved' 
    `

    const queryParams = []

    // Add filters
    if (type) {
      query += " AND r.type = ?"
      queryParams.push(type)
    }

    if (department) {
      query += " AND r.department = ?"
      queryParams.push(department)
    }

    if (search) {
      query +=
        " AND (r.title LIKE ? OR r.description LIKE ? OR u1.fullName LIKE ? OR u2.fullName LIKE ? OR u3.fullName LIKE ? OR rm.course LIKE ?)"
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (course) {
      query += " AND rm.course LIKE ?"
      queryParams.push(`%${course}%`)
    }

    // Count total resources for pagination
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as filtered`, queryParams)
    const totalResources = countResult[0].total

    // Add pagination
    query += " ORDER BY r.createdAt DESC LIMIT ? OFFSET ?"
    queryParams.push(Number.parseInt(limit), Number.parseInt(offset))

    // Execute query
    const [resources] = await db.query(query, queryParams)

    res.status(200).json({
      success: true,
      count: resources.length,
      total: totalResources,
      totalPages: Math.ceil(totalResources / limit),
      currentPage: Number.parseInt(page),
      resources,
    })
  } catch (error) {
    console.error("Error fetching public resources:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching public resources",
      error: error.message,
    })
  }
})

// Get featured resources for home page
router.get("/featured", async (req, res) => {
  try {
    const query = ` 
      SELECT r.*,   
        u1.fullName AS uploadedByName,   
        u2.fullName AS studentName,   
        u3.fullName AS supervisorName,  
        rm.year, rm.semester, rm.course, rm.tags,
        u2.department AS studentDepartment  
      FROM resources r  
      LEFT JOIN users u1 ON r.uploadedBy = u1.id  
      LEFT JOIN users u2 ON r.studentId = u2.id  
      LEFT JOIN users u3 ON r.supervisorId = u3.id  
      LEFT JOIN resource_metadata rm ON r.id = rm.resourceId  
      WHERE r.status = 'approved' 
      ORDER BY r.views DESC, r.createdAt DESC 
      LIMIT 10 
    `

    const [resources] = await db.query(query)

    res.status(200).json({
      success: true,
      resources,
    })
  } catch (error) {
    console.error("Error fetching featured resources:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching featured resources",
      error: error.message,
    })
  }
})

// Get recently approved resources
router.get("/recent", async (req, res) => {
  try {
    const query = ` 
      SELECT r.*,   
        u1.fullName AS uploadedByName,   
        u2.fullName AS studentName,   
        u3.fullName AS supervisorName,  
        rm.year, rm.semester, rm.course, rm.tags,
        u2.department AS studentDepartment  
      FROM resources r  
      LEFT JOIN users u1 ON r.uploadedBy = u1.id  
      LEFT JOIN users u2 ON r.studentId = u2.id  
      LEFT JOIN users u3 ON r.supervisorId = u3.id  
      LEFT JOIN resource_metadata rm ON r.id = rm.resourceId  
      WHERE r.status = 'approved' 
      ORDER BY r.updatedAt DESC, r.createdAt DESC 
      LIMIT 10 
    `

    const [resources] = await db.query(query)

    res.status(200).json({
      success: true,
      resources,
    })
  } catch (error) {
    console.error("Error fetching recent resources:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching recent resources",
      error: error.message,
    })
  }
})

// Get a single resource by ID with detailed information
router.get("/:id", async (req, res) => {
  try {
    const resourceId = req.params.id

    // Get resource details with comprehensive information
    const [resources] = await db.query(
      `SELECT r.*,   
        u1.fullName AS uploadedByName,
        u1.email AS uploaderEmail,
        u1.department AS uploaderDepartment,
        u2.fullName AS studentName,
        u2.email AS studentEmail,
        u2.indexNumber AS studentIndexNumber,
        u2.department AS studentDepartment,
        u3.fullName AS supervisorName,
        u3.email AS supervisorEmail,
        u3.department AS supervisorDepartment,
        rm.year, rm.semester, rm.course, rm.tags,
        DATE_FORMAT(r.createdAt, '%d %M %Y') AS formattedCreatedDate,
        DATE_FORMAT(r.updatedAt, '%d %M %Y') AS formattedUpdatedDate
      FROM resources r  
      LEFT JOIN users u1 ON r.uploadedBy = u1.id  
      LEFT JOIN users u2 ON r.studentId = u2.id  
      LEFT JOIN users u3 ON r.supervisorId = u3.id  
      LEFT JOIN resource_metadata rm ON r.id = rm.resourceId  
      WHERE r.id = ?`,
      [resourceId],
    )

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    const resource = resources[0]

    // Check if resource is approved or user is the uploader or admin or supervisor
    const isAuthenticated = req.session && req.session.user
    const isAuthorized =
      isAuthenticated &&
      (resource.status === "approved" ||
        req.session.user.id === resource.uploadedBy ||
        req.session.user.role === "admin" ||
        (req.session.user.role === "supervisor" && req.session.user.id === resource.supervisorId))

    if (!isAuthenticated && resource.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this resource",
      })
    }

    if (isAuthenticated && !isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this resource",
      })
    }

    // Log view if user is authenticated
    if (isAuthenticated) {
      await db.query(
        "INSERT INTO resource_access_logs (resourceId, userId, action, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?)",
        [resourceId, req.session.user.id, "view", req.ip, req.headers["user-agent"]],
      )

      // Increment view count
      await db.query("UPDATE resources SET views = views + 1 WHERE id = ?", [resourceId])
    }

    // Get comments for this resource
    const [comments] = await db.query(
      `SELECT c.*, u.fullName, u.role 
       FROM comments c 
       JOIN users u ON c.userId = u.id 
       WHERE c.resourceId = ? 
       ORDER BY c.createdAt DESC`,
      [resourceId],
    )

    // Add comments to the resource object
    resource.comments = comments

    res.status(200).json({
      success: true,
      resource,
    })
  } catch (error) {
    console.error("Error fetching resource:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching resource",
      error: error.message,
    })
  }
})

// Download resource
router.get("/:id/download", async (req, res) => {
  try {
    const resourceId = req.params.id

    // Get resource details
    const [resources] = await db.query("SELECT * FROM resources WHERE id = ?", [resourceId])

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    const resource = resources[0]

    // Check if resource is approved or user is authorized
    const isAuthenticated = req.session && req.session.user
    const isAuthorized =
      isAuthenticated &&
      (resource.status === "approved" ||
        req.session.user.id === resource.uploadedBy ||
        req.session.user.role === "admin" ||
        (req.session.user.role === "supervisor" && req.session.user.id === resource.supervisorId))

    if (!isAuthenticated && resource.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to download this resource",
      })
    }

    if (isAuthenticated && !isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to download this resource",
      })
    }

    // Check if file exists
    if (!fs.existsSync(resource.filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    // Log download if user is authenticated
    if (isAuthenticated) {
      await db.query(
        "INSERT INTO resource_access_logs (resourceId, userId, action, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?)",
        [resourceId, req.session.user.id, "download", req.ip, req.headers["user-agent"]],
      )

      // Increment download count
      await db.query("UPDATE resources SET downloads = downloads + 1 WHERE id = ?", [resourceId])
    }

    // Send file
    const fileName = path.basename(resource.filePath)
    res.download(resource.filePath, fileName)
  } catch (error) {
    console.error("Error downloading resource:", error)
    res.status(500).json({
      success: false,
      message: "Error downloading resource",
      error: error.message,
    })
  }
})

// Add this new route after the download resource route
// Preview resource
router.get("/:id/preview", async (req, res) => {
  try {
    const resourceId = req.params.id

    // Get resource details
    const [resources] = await db.query("SELECT * FROM resources WHERE id = ?", [resourceId])

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    const resource = resources[0]

    // Check if resource is approved or user is authorized
    const isAuthenticated = req.session && req.session.user
    const isAuthorized =
      isAuthenticated &&
      (resource.status === "approved" ||
        req.session.user.id === resource.uploadedBy ||
        req.session.user.role === "admin" ||
        (req.session.user.role === "supervisor" && req.session.user.id === resource.supervisorId))

    if (!isAuthenticated && resource.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to preview this resource",
      })
    }

    if (isAuthenticated && !isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to preview this resource",
      })
    }

    // Check if file exists
    if (!fs.existsSync(resource.filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    // Log view if user is authenticated
    if (isAuthenticated) {
      await db.query(
        "INSERT INTO resource_access_logs (resourceId, userId, action, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?)",
        [resourceId, req.session.user.id, "preview", req.ip, req.headers["user-agent"]],
      )
    }

    // Get file extension
    const fileExt = path.extname(resource.filePath).toLowerCase()

    // Set appropriate content type based on file extension
    let contentType = "application/octet-stream" // Default content type

    if (fileExt === ".pdf") {
      contentType = "application/pdf"
    } else if (fileExt === ".doc" || fileExt === ".docx") {
      contentType = "application/msword"
    } else if (fileExt === ".ppt" || fileExt === ".pptx") {
      contentType = "application/vnd.ms-powerpoint"
    } else if (fileExt === ".txt") {
      contentType = "text/plain"
    } else if (fileExt === ".jpg" || fileExt === ".jpeg") {
      contentType = "image/jpeg"
    } else if (fileExt === ".png") {
      contentType = "image/png"
    }

    // Set headers for inline display with proper security headers
    res.setHeader("Content-Type", contentType)
    res.setHeader("Content-Disposition", `inline; filename="${path.basename(resource.filePath)}"`)

    // Add security headers to allow embedding in iframes
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("Content-Security-Policy", "default-src 'self'; object-src 'self'; frame-ancestors 'self'")
    res.setHeader("X-Frame-Options", "SAMEORIGIN")

    // Allow cross-origin resource sharing for the frontend
    res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:3000")
    res.setHeader("Access-Control-Allow-Credentials", "true")

    // Stream the file
    const fileStream = fs.createReadStream(resource.filePath)
    fileStream.pipe(res)
  } catch (error) {
    console.error("Error previewing resource:", error)
    res.status(500).json({
      success: false,
      message: "Error previewing resource",
      error: error.message,
    })
  }
})

// Get available supervisors for project submission
router.get("/supervisors/available", isAuthenticated, async (req, res) => {
  try {
    const { department } = req.query

    let query = `
      SELECT id, fullName, department, email 
      FROM users 
      WHERE role = 'supervisor' AND isActive = true
    `
    const queryParams = []

    // Filter by department if provided
    if (department) {
      query += " AND department = ?"
      queryParams.push(department)
    }

    query += " ORDER BY fullName ASC"

    const [supervisors] = await db.query(query, queryParams)

    res.status(200).json({
      success: true,
      supervisors,
    })
  } catch (error) {
    console.error("Error fetching available supervisors:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching available supervisors",
      error: error.message,
    })
  }
})

// Upload a new resource
router.post("/", isAuthenticated, upload.single("file"), validateResourceUpload, async (req, res) => {
  try {
    console.log("Upload request received:", {
      body: req.body,
      file: req.file
        ? {
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
          }
        : "No file received",
    })

    const {
      title,
      description,
      type,
      department,
      studentId,
      supervisorId,
      supervisorName,
      year,
      semester,
      course,
      tags,
    } = req.body

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    const filePath = req.file.path
    const fileSize = req.file.size
    const fileType = req.file.mimetype
    const uploadedBy = req.session.user.id

    // Determine initial status based on user role and resource type
    let status = "pending"
    if (req.session.user.role === "admin" || (req.session.user.role === "supervisor" && type !== "final-project")) {
      status = "approved"
    }

    // Begin transaction
    await db.query("START TRANSACTION")

    // For final year projects, ensure supervisor is assigned
    let resolvedSupervisorId = supervisorId || null

    if (type === "final-project") {
      // If uploader is a student, require supervisor
      if (req.session.user.role === "student") {
        if (!supervisorId && !supervisorName) {
          // If no supervisor specified, find one from the same department
          const [departmentSupervisors] = await db.query(
            "SELECT id FROM users WHERE role = 'supervisor' AND department = ? AND isActive = true LIMIT 1",
            [department],
          )

          if (departmentSupervisors.length > 0) {
            resolvedSupervisorId = departmentSupervisors[0].id
          } else {
            // If no supervisor found in the department, assign to any active supervisor
            const [anySupervisor] = await db.query(
              "SELECT id FROM users WHERE role = 'supervisor' AND isActive = true LIMIT 1",
            )

            if (anySupervisor.length > 0) {
              resolvedSupervisorId = anySupervisor[0].id
            }
          }
        } else if (supervisorName && !supervisorId) {
          // Find supervisor by name
          const [supervisors] = await db.query(
            "SELECT id FROM users WHERE fullName = ? AND role = 'supervisor' AND isActive = true LIMIT 1",
            [supervisorName],
          )

          if (supervisors.length > 0) {
            resolvedSupervisorId = supervisors[0].id
          }
        }
      }

      // If uploader is a supervisor, they become the supervisor automatically
      if (req.session.user.role === "supervisor") {
        resolvedSupervisorId = req.session.user.id
      }
    }

    console.log("Inserting resource with data:", {
      title,
      description,
      type,
      department,
      uploadedBy,
      studentId: studentId || (req.session.user.role === "student" ? req.session.user.id : null),
      supervisorId: resolvedSupervisorId,
      status,
    })

    // Insert resource
    const [result] = await db.query(
      `INSERT INTO resources   
        (title, description, type, department, filePath, fileSize, fileType, uploadedBy, studentId, supervisorId, status, rejectionReason)   
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        title,
        description,
        type,
        department,
        filePath,
        fileSize,
        fileType,
        uploadedBy,
        studentId || (req.session.user.role === "student" ? req.session.user.id : null),
        resolvedSupervisorId,
        status,
      ],
    )

    const resourceId = result.insertId

    // Insert metadata if provided
    if (year || semester || course || tags) {
      await db.query(
        "INSERT INTO resource_metadata (resourceId, year, semester, course, tags) VALUES (?, ?, ?, ?, ?)",
        [resourceId, year || null, semester || null, course || null, tags || null],
      )
    }

    // Notify supervisor if assigned
    if (resolvedSupervisorId) {
      await db.query(
        "INSERT INTO notifications (userId, type, message, resourceId, isRead) VALUES (?, 'resource_assigned', ?, ?, false)",
        [resolvedSupervisorId, `New project assigned for review: ${title}`, resourceId],
      )
    }

    // Notify admin about new resource
    const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'")
    for (const admin of admins) {
      await db.query(
        "INSERT INTO notifications (userId, type, message, resourceId, isRead) VALUES (?, 'new_resource', ?, ?, false)",
        [admin.id, `New ${type} uploaded: ${title}`, resourceId],
      )
    }

    // Commit transaction
    await db.query("COMMIT")

    res.status(201).json({
      success: true,
      message: "Resource uploaded successfully",
      resource: {
        id: resourceId,
        title,
        description,
        type,
        department,
        status,
        filePath,
      },
    })
  } catch (error) {
    // Rollback transaction on error
    await db.query("ROLLBACK")

    console.error("Error uploading resource:", error)
    res.status(500).json({
      success: false,
      message: "Error uploading resource",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Get pending resources for supervisor approval
router.get("/pending/supervisor", isAuthenticated, isAuthorized(["supervisor"]), async (req, res) => {
  try {
    const supervisorId = req.session.user.id
    const { department } = req.session.user

    let query = ` 
      SELECT r.*,   
        u1.fullName AS uploadedByName,   
        u2.fullName AS studentName,
        u2.email AS studentEmail,
        u2.indexNumber AS studentIndexNumber,
        u2.department AS studentDepartment,
        rm.year, rm.semester, rm.course, rm.tags,
        DATE_FORMAT(r.createdAt, '%d %M %Y') AS formattedCreatedDate
      FROM resources r  
      LEFT JOIN users u1 ON r.uploadedBy = u1.id  
      LEFT JOIN users u2 ON r.studentId = u2.id  
      LEFT JOIN resource_metadata rm ON r.id = rm.resourceId  
      WHERE r.status = 'pending' AND  
      `

    const queryParams = []

    // For final year projects, supervisor can only approve projects in their department
    // For mini projects, any supervisor can approve
    query += `( 
      (r.type = 'final-project' AND (r.supervisorId = ? OR r.department = ?)) OR  
      (r.type = 'mini-project') 
    )`

    queryParams.push(supervisorId, department)
    query += " ORDER BY r.createdAt DESC"

    const [resources] = await db.query(query, queryParams)

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    })
  } catch (error) {
    console.error("Error fetching pending resources:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching pending resources",
      error: error.message,
    })
  }
})

// Get pending resources for admin approval
router.get("/pending/admin", isAuthenticated, isAuthorized(["admin"]), async (req, res) => {
  try {
    const [resources] = await db.query(
      `SELECT r.*,   
        u1.fullName AS uploadedByName,   
        u2.fullName AS studentName, 
        u2.email AS studentEmail,
        u2.indexNumber AS studentIndexNumber,
        u2.department AS studentDepartment,
        u3.fullName AS supervisorName, 
        u3.email AS supervisorEmail,
        u3.department AS supervisorDepartment,
        rm.year, rm.semester, rm.course, rm.tags,
        DATE_FORMAT(r.createdAt, '%d %M %Y') AS formattedCreatedDate
      FROM resources r  
      LEFT JOIN users u1 ON r.uploadedBy = u1.id  
      LEFT JOIN users u2 ON r.studentId = u2.id  
      LEFT JOIN users u3 ON r.supervisorId = u3.id 
      LEFT JOIN resource_metadata rm ON r.id = rm.resourceId  
      WHERE r.status = 'pending' 
      ORDER BY r.createdAt DESC`,
    )

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    })
  } catch (error) {
    console.error("Error fetching pending resources:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching pending resources",
      error: error.message,
    })
  }
})

// Get student resources
router.get("/student/my-resources", isAuthenticated, isAuthorized(["student"]), async (req, res) => {
  try {
    const studentId = req.session.user.id

    const [resources] = await db.query(
      `SELECT r.*,   
        u1.fullName AS uploadedByName,   
        u3.fullName AS supervisorName, 
        rm.year, rm.semester, rm.course, rm.tags,
        DATE_FORMAT(r.createdAt, '%d %M %Y') AS formattedCreatedDate,
        DATE_FORMAT(r.updatedAt, '%d %M %Y') AS formattedUpdatedDate
      FROM resources r  
      LEFT JOIN users u1 ON r.uploadedBy = u1.id  
      LEFT JOIN users u3 ON r.supervisorId = u3.id 
      LEFT JOIN resource_metadata rm ON r.id = rm.resourceId  
      WHERE r.studentId = ? OR r.uploadedBy = ? 
      ORDER BY r.createdAt DESC`,
      [studentId, studentId],
    )

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    })
  } catch (error) {
    console.error("Error fetching student resources:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching student resources",
      error: error.message,
    })
  }
})

// Update resource status (approve/reject)
router.patch("/:id/status", isAuthenticated, isSupervisorOrAdmin, validateResourceAction, async (req, res) => {
  try {
    const resourceId = req.params.id
    const { status, rejectionReason } = req.body

    // Get resource details
    const [resources] = await db.query(
      `SELECT r.*, u.id AS studentId, u.fullName AS studentName 
       FROM resources r 
       LEFT JOIN users u ON r.studentId = u.id 
       WHERE r.id = ?`,
      [resourceId],
    )

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    const resource = resources[0]

    // Check if user is authorized to update status
    if (req.session.user.role === "supervisor") {
      // For final year projects, only the assigned supervisor or supervisor from same department can approve/reject
      if (resource.type === "final-project") {
        const [supervisorDept] = await db.query("SELECT department FROM users WHERE id = ?", [req.session.user.id])

        if (resource.supervisorId !== req.session.user.id && supervisorDept[0].department !== resource.department) {
          return res.status(403).json({
            success: false,
            message: "You are not authorized to update this resource's status",
          })
        }
      }
    }

    // Begin transaction
    await db.query("START TRANSACTION")

    // Update resource status
    const [result] = await db.query(
      "UPDATE resources SET status = ?, rejectionReason = ?, updatedAt = NOW() WHERE id = ?",
      [status, status === "rejected" ? rejectionReason : null, resourceId],
    )

    if (result.affectedRows === 0) {
      await db.query("ROLLBACK")
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    // Create notification for the student
    if (resource.studentId) {
      const notificationMessage =
        status === "approved"
          ? `Your project "${resource.title}" has been approved`
          : `Your project "${resource.title}" has been rejected: ${rejectionReason}`

      await db.query(
        "INSERT INTO notifications (userId, type, message, resourceId, isRead) VALUES (?, ?, ?, ?, false)",
        [
          resource.studentId,
          status === "approved" ? "resource_approved" : "resource_rejected",
          notificationMessage,
          resourceId,
        ],
      )
    }

    // Commit transaction
    await db.query("COMMIT")

    res.status(200).json({
      success: true,
      message: `Resource ${status === "approved" ? "approved" : "rejected"} successfully`,
    })
  } catch (error) {
    // Rollback transaction on error
    await db.query("ROLLBACK")

    console.error("Error updating resource status:", error)
    res.status(500).json({
      success: false,
      message: "Error updating resource status",
      error: error.message,
    })
  }
})

// Update resource
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const resourceId = req.params.id

    // Get resource details
    const [resources] = await db.query("SELECT * FROM resources WHERE id = ?", [resourceId])

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    const resource = resources[0]

    // Check if user is authorized to update resource
    if (req.session.user.role !== "admin" && req.session.user.id !== resource.uploadedBy) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this resource",
      })
    }

    const { title, description, department, type, supervisorId, year, semester, course, tags } = req.body

    // Begin transaction
    await db.query("START TRANSACTION")

    // Update resource
    let query = "UPDATE resources SET title = ?, description = ?, department = ?, type = ?, updatedAt = NOW()"
    const queryParams = [title, description, department, type]

    // Update supervisor if provided
    if (supervisorId) {
      query += ", supervisorId = ?"
      queryParams.push(supervisorId)
    }

    query += " WHERE id = ?"
    queryParams.push(resourceId)

    await db.query(query, queryParams)

    // Update metadata
    if (year || semester || course || tags) {
      // Check if metadata exists
      const [metadata] = await db.query("SELECT * FROM resource_metadata WHERE resourceId = ?", [resourceId])

      if (metadata.length > 0) {
        // Update existing metadata
        await db.query(
          "UPDATE resource_metadata SET year = ?, semester = ?, course = ?, tags = ? WHERE resourceId = ?",
          [year || null, semester || null, course || null, tags || null, resourceId],
        )
      } else {
        // Insert new metadata
        await db.query(
          "INSERT INTO resource_metadata (resourceId, year, semester, course, tags) VALUES (?, ?, ?, ?, ?)",
          [resourceId, year || null, semester || null, course || null, tags || null],
        )
      }
    }

    // Commit transaction
    await db.query("COMMIT")

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
    })
  } catch (error) {
    // Rollback transaction on error
    await db.query("ROLLBACK")

    console.error("Error updating resource:", error)
    res.status(500).json({
      success: false,
      message: "Error updating resource",
      error: error.message,
    })
  }
})

// Delete a resource
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const resourceId = req.params.id

    // Get resource details
    const [resources] = await db.query("SELECT * FROM resources WHERE id = ?", [resourceId])

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    const resource = resources[0]

    // Check if user is authorized to delete (admin or resource uploader)
    if (req.session.user.role !== "admin" && req.session.user.id !== resource.uploadedBy) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this resource",
      })
    }

    // Begin transaction
    await db.query("START TRANSACTION")

    // Delete resource metadata
    await db.query("DELETE FROM resource_metadata WHERE resourceId = ?", [resourceId])

    // Delete resource access logs
    await db.query("DELETE FROM resource_access_logs WHERE resourceId = ?", [resourceId])

    // Delete comments
    await db.query("DELETE FROM comments WHERE resourceId = ?", [resourceId])

    // Delete bookmarks
    await db.query("DELETE FROM bookmarks WHERE resourceId = ?", [resourceId])

    // Delete notifications related to this resource
    await db.query("DELETE FROM notifications WHERE resourceId = ?", [resourceId])

    // Delete resource
    await db.query("DELETE FROM resources WHERE id = ?", [resourceId])

    // Commit transaction
    await db.query("COMMIT")

    // Delete file from filesystem
    if (fs.existsSync(resource.filePath)) {
      fs.unlinkSync(resource.filePath)
    }

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    })
  } catch (error) {
    // Rollback transaction on error
    await db.query("ROLLBACK")

    console.error("Error deleting resource:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting resource",
      error: error.message,
    })
  }
})

// Add a comment to a resource
router.post("/:id/comments", isAuthenticated, async (req, res) => {
  try {
    const resourceId = req.params.id
    const { content } = req.body
    const userId = req.session.user.id

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      })
    }

    // Check if resource exists
    const [resources] = await db.query("SELECT * FROM resources WHERE id = ?", [resourceId])

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    // Insert comment
    const [result] = await db.query("INSERT INTO comments (resourceId, userId, content) VALUES (?, ?, ?)", [
      resourceId,
      userId,
      content,
    ])

    // Get the comment with user details
    const [comments] = await db.query(
      `SELECT c.*, u.fullName, u.role 
       FROM comments c 
       JOIN users u ON c.userId = u.id 
       WHERE c.id = ?`,
      [result.insertId],
    )

    // Notify resource owner if different from commenter
    const resource = resources[0]
    if (resource.uploadedBy !== userId) {
      await db.query(
        "INSERT INTO notifications (userId, type, message, resourceId, isRead) VALUES (?, 'new_comment', ?, ?, false)",
        [resource.uploadedBy, `New comment on your resource "${resource.title}"`, resourceId],
      )
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: comments[0],
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    })
  }
})

// Get comments for a resource
router.get("/:id/comments", async (req, res) => {
  try {
    const resourceId = req.params.id

    // Check if resource exists
    const [resources] = await db.query("SELECT * FROM resources WHERE id = ?", [resourceId])

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    // Get comments with user details
    const [comments] = await db.query(
      `SELECT c.*, u.fullName, u.role 
       FROM comments c 
       JOIN users u ON c.userId = u.id 
       WHERE c.resourceId = ? 
       ORDER BY c.createdAt DESC`,
      [resourceId],
    )

    res.status(200).json({
      success: true,
      comments,
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    })
  }
})

module.exports = router
