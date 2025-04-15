const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const db = require("../config/database")
const { validateRegistration, validateLogin } = require("../middleware/validators")
const { isAdmin } = require("../middleware/auth")

// Register a new user
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { username, email, password, fullName, indexNumber, phoneNumber, role, department } = req.body

    // Check if email already exists
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username])

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists",
      })
    }

    // Only admin can create admin or supervisor accounts
    if (
      (role === "admin" || role === "supervisor") &&
      (!req.session || !req.session.user || req.session.user.role !== "admin")
    ) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can create a supervisor accounts",
      })
    }

    // Students must have an index number
    if ((role === "student" || !role) && !indexNumber) {
      return res.status(400).json({
        success: false,
        message: "Index number is required for student accounts",
      })
    }

    // Supervisors must have a department
    if (role === "supervisor" && !department) {
      return res.status(400).json({
        success: false,
        message: "Department is required for supervisor accounts",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert new user
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, fullName, indexNumber, phoneNumber, role, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [username, email, hashedPassword, fullName, indexNumber, phoneNumber, role || "student", department],
    )

    // Return success without password
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: result.insertId,
        username,
        email,
        fullName,
        role: role || "student",
        department,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    })
  }
})

// Login user
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    const user = users[0]

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated. Please contact an administrator.",
      })
    }

    // Create session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    })
  }
})

// Logout user
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error logging out",
        error: err.message,
      })
    }

    res.clearCookie("session_cookie_name")
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  })
})

// Get current user
router.get("/me", async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      })
    }

    const [users] = await db.query(
      "SELECT id, username, email, fullName, indexNumber, phoneNumber, role, department, profileImage, createdAt FROM users WHERE id = ?",
      [req.session.user.id],
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
    console.error("Get current user error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
      error: error.message,
    })
  }
})

// Create initial admin account (one-time setup)
router.post("/setup-admin", async (req, res) => {
  try {
    // Check if admin already exists
    const [existingAdmins] = await db.query("SELECT * FROM users WHERE role = 'admin'")

    if (existingAdmins.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Admin account already exists",
      })
    }

    const { username, email, password, fullName } = req.body

    // Validate required fields
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: username, email, password, fullName",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert admin user
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, fullName, role, isActive) VALUES (?, ?, ?, ?, 'admin', true)",
      [username, email, hashedPassword, fullName],
    )

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      user: {
        id: result.insertId,
        username,
        email,
        fullName,
        role: "admin",
      },
    })
  } catch (error) {
    console.error("Admin setup error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating admin account",
      error: error.message,
    })
  }
})

module.exports = router
