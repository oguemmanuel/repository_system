const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const db = require("../config/database")
const { isAuthenticated, isAuthorized, isAdmin } = require("../middleware/auth")

// Get all supervisors (accessible to all authenticated users)
router.get("/supervisors", isAuthenticated, async (req, res) => {
  try {
    const [supervisors] = await db.query(
      `SELECT id, username, fullName, department, email, phoneNumber, isActive  
       FROM users  
       WHERE role = 'supervisor' 
       ORDER BY fullName ASC`,
    )

    res.status(200).json({
      success: true,
      supervisors,
    })
  } catch (error) {
    console.error("Error fetching supervisors:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching supervisors",
      error: error.message,
    })
  }
})

// Get supervisors by department
router.get("/supervisors/department/:department", isAuthenticated, async (req, res) => {
  try {
    const department = req.params.department

    const [supervisors] = await db.query(
      `SELECT id, username, fullName, department, email, phoneNumber
       FROM users
       WHERE role = 'supervisor' AND isActive = true AND department = ?
       ORDER BY fullName ASC`,
      [department],
    )

    res.status(200).json({
      success: true,
      supervisors,
    })
  } catch (error) {
    console.error("Error fetching supervisors by department:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching supervisors by department",
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

// Get all students (admin only)
router.get("/students", isAuthenticated, isAuthorized(["admin", "supervisor"]), async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT id, username, fullName, email, indexNumber, phoneNumber, department, isActive
       FROM users
       WHERE role = 'student'
       ORDER BY fullName ASC`,
    )

    res.status(200).json({
      success: true,
      students,
    })
  } catch (error) {
    console.error("Error fetching students:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    })
  }
})

// Get all users (admin only)
router.get("/", isAuthenticated, isAuthorized(["admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query
    const offset = (page - 1) * limit

    let query = ` 
      SELECT id, username, email, fullName, indexNumber, phoneNumber, role, department,  
             profileImage, isActive, createdAt, updatedAt  
      FROM users 
      WHERE 1=1 
    `

    const queryParams = []

    // Add filters
    if (role) {
      query += " AND role = ?"
      queryParams.push(role)
    }

    if (isActive !== undefined) {
      query += " AND isActive = ?"
      queryParams.push(isActive === "true")
    }

    if (search) {
      query += " AND (username LIKE ? OR email LIKE ? OR fullName LIKE ? OR indexNumber LIKE ?)"
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    // Count total users for pagination
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as filtered`, queryParams)
    const totalUsers = countResult[0].total

    // Add pagination
    query += " ORDER BY createdAt DESC LIMIT ? OFFSET ?"
    queryParams.push(Number.parseInt(limit), Number.parseInt(offset))

    // Execute query
    const [users] = await db.query(query, queryParams)

    res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: Number.parseInt(page),
      users,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    })
  }
})

// Get user by ID
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id

    // Check if user is authorized (admin or self)
    if (req.session.user.role !== "admin" && req.session.user.id !== Number.parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this user",
      })
    }

    const [users] = await db.query(
      `SELECT id, username, email, fullName, indexNumber, phoneNumber, role, department,  
             profileImage, isActive, createdAt, updatedAt  
      FROM users 
      WHERE id = ?`,
      [userId],
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user: users[0],
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    })
  }
})

// Create new user (admin only)
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { username, email, password, fullName, indexNumber, phoneNumber, role, department } = req.body

    // Check if email or username already exists
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username])

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists",
      })
    }

    // Validate role-specific requirements
    if (role === "supervisor" && !department) {
      return res.status(400).json({
        success: false,
        message: "Department is required for supervisors",
      })
    }

    if (role === "student" && !indexNumber) {
      return res.status(400).json({
        success: false,
        message: "Index number is required for students",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert new user
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, fullName, indexNumber, phoneNumber, role, department, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)",
      [username, email, hashedPassword, fullName, indexNumber, phoneNumber, role, department],
    )

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: result.insertId,
        username,
        email,
        fullName,
        indexNumber,
        phoneNumber,
        role,
        department,
      },
    })
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    })
  }
})

// Update user
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id

    // Check if user is authorized (admin or self)
    if (req.session.user.role !== "admin" && req.session.user.id !== Number.parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this user",
      })
    }

    const { fullName, phoneNumber, department, password, email, username, indexNumber } = req.body

    // If admin is updating email or username, check if they already exist
    if ((email || username) && req.session.user.role === "admin") {
      const [existingUsers] = await db.query("SELECT * FROM users WHERE (email = ? OR username = ?) AND id != ?", [
        email || "",
        username || "",
        userId,
      ])

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email or username already exists",
        })
      }
    }

    // Build update query
    let query = "UPDATE users SET "
    const queryParams = []

    if (fullName) {
      query += "fullName = ?, "
      queryParams.push(fullName)
    }

    if (phoneNumber) {
      query += "phoneNumber = ?, "
      queryParams.push(phoneNumber)
    }

    if (department) {
      query += "department = ?, "
      queryParams.push(department)
    }

    if (email && req.session.user.role === "admin") {
      query += "email = ?, "
      queryParams.push(email)
    }

    if (username && req.session.user.role === "admin") {
      query += "username = ?, "
      queryParams.push(username)
    }

    if (indexNumber && req.session.user.role === "admin") {
      query += "indexNumber = ?, "
      queryParams.push(indexNumber)
    }

    if (password) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      query += "password = ?, "
      queryParams.push(hashedPassword)
    }

    // Remove trailing comma and space
    query = query.slice(0, -2)

    // Add WHERE clause
    query += " WHERE id = ?"
    queryParams.push(userId)

    // Execute update
    const [result] = await db.query(query, queryParams)

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    })
  }
})

// Change user role (admin only)
router.patch("/:id/role", isAuthenticated, isAuthorized(["admin"]), async (req, res) => {
  try {
    const userId = req.params.id
    const { role, department } = req.body

    if (!role || !["student", "supervisor", "admin", "faculty"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      })
    }

    // If changing to supervisor, department is required
    if (role === "supervisor" && !department) {
      return res.status(400).json({
        success: false,
        message: "Department is required for supervisors",
      })
    }

    // Update role and department if provided
    let query = "UPDATE users SET role = ?"
    const queryParams = [role]

    if (department) {
      query += ", department = ?"
      queryParams.push(department)
    }

    query += " WHERE id = ?"
    queryParams.push(userId)

    const [result] = await db.query(query, queryParams)

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user role",
      error: error.message,
    })
  }
})

// Deactivate/activate user (admin only)
router.patch("/:id/status", isAuthenticated, isAuthorized(["admin"]), async (req, res) => {
  try {
    const userId = req.params.id
    const { isActive } = req.body

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive field is required",
      })
    }

    const [result] = await db.query("UPDATE users SET isActive = ? WHERE id = ?", [isActive, userId])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    })
  } catch (error) {
    console.error("Error updating user status:", error)
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message,
    })
  }
})

// Delete user (admin only)
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id

    // Prevent deleting the last admin
    if (req.session.user.id === Number.parseInt(userId) && req.session.user.role === "admin") {
      const [adminCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")

      if (adminCount[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last admin account",
        })
      }
    }

    // Check if user has resources
    const [resourceCount] = await db.query(
      "SELECT COUNT(*) as count FROM resources WHERE uploadedBy = ? OR studentId = ? OR supervisorId = ?",
      [userId, userId, userId],
    )

    if (resourceCount[0].count > 0) {
      // Update resources to remove references to this user
      await db.query("UPDATE resources SET supervisorId = NULL WHERE supervisorId = ?", [userId])
      // For resources uploaded by this user, we could either delete them or reassign them
      // Here we'll reassign them to the admin making the request
      await db.query("UPDATE resources SET uploadedBy = ? WHERE uploadedBy = ?", [req.session.user.id, userId])
      await db.query("UPDATE resources SET studentId = NULL WHERE studentId = ?", [userId])
    }

    // Delete user
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    })
  }
})

// Get all departments
router.get("/departments/all", async (req, res) => {
  try {
    const [departments] = await db.query(
      "SELECT DISTINCT department FROM users WHERE department IS NOT NULL ORDER BY department",
    )

    const departmentList = departments.map((item) => item.department).filter(Boolean)

    res.status(200).json({
      success: true,
      departments: departmentList,
    })
  } catch (error) {
    console.error("Error fetching departments:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching departments",
      error: error.message,
    })
  }
})

module.exports = router
