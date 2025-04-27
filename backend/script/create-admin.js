const bcrypt = require("bcrypt")
const mysql = require("mysql2/promise")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cug_repository",
}

async function createAdminUser() {
  let connection

  try {
    // Create database connection
    connection = await mysql.createConnection(dbConfig)
    console.log("Connected to database successfully")

    // Check if admin user already exists
    const [existingAdmins] = await connection.execute("SELECT * FROM users WHERE role = 'admin' LIMIT 1")

    if (existingAdmins.length > 0) {
      console.log("Admin user already exists. Skipping creation.")
      return
    }

    // Admin user details
    const adminUser = {
      username: "admin",
      email: "admin@cug.edu.gh",
      password: "admin123", // This will be hashed
      fullName: "System Administrator",
      role: "admin",
      department: "Administration",
    }

    // Hash the password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(adminUser.password, saltRounds)

    // Insert admin user into database
    const [result] = await connection.execute(
      "INSERT INTO users (username, email, password, fullName, role, department, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        adminUser.username,
        adminUser.email,
        hashedPassword,
        adminUser.fullName,
        adminUser.role,
        adminUser.department,
        true,
      ],
    )

    console.log(`Admin user created successfully with ID: ${result.insertId}`)
    console.log("Username:", adminUser.username)
    console.log("Password:", adminUser.password)
    console.log("Please change the password after first login!")
  } catch (error) {
    console.error("Error creating admin user:", error)
  } finally {
    if (connection) {
      await connection.end()
      console.log("Database connection closed")
    }
  }
}

// Execute the function
createAdminUser()
