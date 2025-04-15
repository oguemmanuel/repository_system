const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const db = require("../config/database")
const { isAuthenticated, isAuthorized, isSupervisorOrAdmin } = require("../middleware/auth")
const { validateResourceUpload, validateResourceAction } = require("../middleware/validators")

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

// Get all resources with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, type, department, search, status, supervisorId, studentId } = req.query
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
      query += " AND (r.title LIKE ? OR r.description LIKE ?)"
      queryParams.push(`%${search}%`, `%${search}%`)
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
    const { page = 1, limit = 10, type, department, search } = req.query
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
      query += " AND (r.title LIKE ? OR r.description LIKE ?)"
      queryParams.push(`%${search}%`, `%${search}%`)
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
        rm.year, rm.semester, rm.course, rm.tags 
      FROM resources r 
      LEFT JOIN users u1 ON r.uploadedBy = u1.id 
      LEFT JOIN users u2 ON r.studentId = u2.id 
      LEFT JOIN users u3 ON r.supervisorId = u3.id 
      LEFT JOIN resource_metadata rm ON r.id = rm.resourceId 
      WHERE r.status = 'approved'
      ORDER BY r.views DESC, r.createdAt DESC
      LIMIT 6
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

// Get a single resource by ID
router.get("/:id", async (req, res) => {
  try {
    const resourceId = req.params.id

    // Get resource details
    const [resources] = await db.query(
      `SELECT r.*,  
        u1.fullName AS uploadedByName,  
        u2.fullName AS studentName,  
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
        rm.year, rm.semester, rm.course, rm.tags 
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
        u3.fullName AS supervisorName,
        rm.year, rm.semester, rm.course, rm.tags 
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
        rm.year, rm.semester, rm.course, rm.tags 
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
    const [resources] = await db.query("SELECT * FROM resources WHERE id = ?", [resourceId])

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

    // Update resource status
    const [result] = await db.query("UPDATE resources SET status = ?, rejectionReason = ? WHERE id = ?", [
      status,
      status === "rejected" ? rejectionReason : null,
      resourceId,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    res.status(200).json({
      success: true,
      message: `Resource ${status === "approved" ? "approved" : "rejected"} successfully`,
    })
  } catch (error) {
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
    let query = "UPDATE resources SET title = ?, description = ?, department = ?, type = ?"
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

module.exports = router
