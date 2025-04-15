const bcrypt = require("bcrypt")
const db = require("../config/database")

// Function to create initial admin account
const setupAdmin = async () => {
  try {
    // Check if admin already exists
    const [existingAdmins] = await db.query("SELECT * FROM users WHERE role = 'admin'")

    if (existingAdmins.length > 0) {
      console.log("Admin account already exists. Skipping setup.")
      return
    }

    // Admin credentials - these should be changed after first login
    const adminUser = {
      username: "admin",
      email: "admin@cug.edu.gh",
      password: "admin123", // This should be changed immediately after first login
      fullName: "System Administrator",
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(adminUser.password, salt)

    // Insert admin user
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, fullName, role, isActive) VALUES (?, ?, ?, ?, 'admin', true)",
      [adminUser.username, adminUser.email, hashedPassword, adminUser.fullName],
    )

    console.log("Admin account created successfully:", {
      id: result.insertId,
      username: adminUser.username,
      email: adminUser.email,
      fullName: adminUser.fullName,
      role: "admin",
    })

    console.log("IMPORTANT: Please change the admin password after first login!")
  } catch (error) {
    console.error("Admin setup error:", error)
  } finally {
    // Close database connection
    process.exit(0)
  }
}

// Run the setup
setupAdmin()
