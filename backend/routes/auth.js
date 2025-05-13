const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const db = require("../config/database")
const { validateRegistration, validateLogin } = require("../middleware/validators")
const { sendWelcomeEmail } = require("../utils/emailService")

// User registration route
router.post("/register", async (req, res) => {
  try {
    const { username, fullName, email, password, department, role, indexNumber, staffID, phoneNumber } = req.body

    // Check if user already exists
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Check if username is provided
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      })
    }

    // Check if username already exists
    const [existingUsernames] = await db.query("SELECT * FROM users WHERE username = ?", [username])

    if (existingUsernames.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already taken. Please choose another one.",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Prepare additional fields based on role
    const userRole = role || "student"
    const additionalFields = {}

    if (userRole === "student" && indexNumber) {
      additionalFields.indexNumber = indexNumber
    }

    if (userRole === "supervisor" && staffID) {
      additionalFields.staffID = staffID
    }

    if (phoneNumber) {
      additionalFields.phoneNumber = phoneNumber
    }

    // Insert new user with username
    const [result] = await db.query(
      "INSERT INTO users (username, fullName, email, password, department, role, status, phoneNumber, indexNumber, staffID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        username,
        fullName || "", // Use fullName if provided, otherwise empty string
        email,
        hashedPassword,
        department || null,
        userRole,
        "active",
        additionalFields.phoneNumber || null,
        additionalFields.indexNumber || null,
        additionalFields.staffID || null,
      ],
    )

    if (result.affectedRows === 1) {
      // Send welcome email
      const newUser = {
        id: result.insertId,
        fullName: fullName || "",
        name: fullName || "", // For compatibility with email service
        email: email,
        department: department,
      }

      try {
        await sendWelcomeEmail(newUser)
        console.log(`Welcome email sent to ${email}`)
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
        // Continue with registration even if email fails
      }

      res.status(201).json({
        success: true,
        message: "Registration successful",
        user: {
          id: result.insertId,
          username,
          fullName,
          email,
          department,
          role: userRole,
        },
      })
    } else {
      throw new Error("Failed to register user")
    }
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Registration failed",
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
    if (user.status !== "active") {
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
      "INSERT INTO users (username, email, password, fullName, role, status) VALUES (?, ?, ?, ?, 'admin', 'active')",
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
