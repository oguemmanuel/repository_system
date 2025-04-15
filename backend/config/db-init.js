const db = require("./database")
const bcrypt = require("bcrypt")

// Function to initialize database tables
async function initializeDatabase() {
  try {
    console.log("Initializing database...")

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fullName VARCHAR(100) NOT NULL,
        indexNumber VARCHAR(50) UNIQUE,
        phoneNumber VARCHAR(20),
        role ENUM('student', 'supervisor', 'admin', 'faculty') NOT NULL DEFAULT 'student',
        department VARCHAR(100),
        profileImage VARCHAR(255),
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log("Users table created or already exists")

    // Create resources table
    await db.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('past-exam', 'mini-project', 'final-project', 'thesis') NOT NULL,
        department VARCHAR(100) NOT NULL,
        filePath VARCHAR(255) NOT NULL,
        fileSize INT,
        fileType VARCHAR(50),
        uploadedBy INT,
        studentId INT,
        supervisorId INT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        downloads INT DEFAULT 0,
        views INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (supervisorId) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    console.log("Resources table created or already exists")

    // Create resource_metadata table
    await db.query(`
      CREATE TABLE IF NOT EXISTS resource_metadata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resourceId INT NOT NULL,
        year VARCHAR(4),
        semester VARCHAR(20),
        course VARCHAR(100),
        tags TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE
      )
    `)
    console.log("Resource metadata table created or already exists")

    // Create resource_access_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS resource_access_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resourceId INT NOT NULL,
        userId INT,
        action ENUM('view', 'download') NOT NULL,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    console.log("Resource access logs table created or already exists")

    // Create comments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resourceId INT NOT NULL,
        userId INT NOT NULL,
        content TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log("Comments table created or already exists")

    // Create bookmarks table
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        resourceId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_resource_unique (userId, resourceId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (resourceId) REFERENCES resources(id) ON DELETE CASCADE
      )
    `)
    console.log("Bookmarks table created or already exists")

    console.log("Database initialization completed successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}

// Run the initialization
initializeDatabase()

module.exports = { initializeDatabase }
