const db = require("../config/database")
const {
  createUsersTable,
  createResourcesTable,
  createResourceMetadataTable,
  createResourceAccessLogsTable,
  createCommentsTable,
  createBookmarksTable,
} = require("./db-schema")

// Function to set up database tables
const setupDatabase = async () => {
  try {
    console.log("Setting up database tables...")

    // Create tables
    await db.query(createUsersTable)
    console.log("Users table created or already exists")

    await db.query(createResourcesTable)
    console.log("Resources table created or already exists")

    await db.query(createResourceMetadataTable)
    console.log("Resource metadata table created or already exists")

    await db.query(createResourceAccessLogsTable)
    console.log("Resource access logs table created or already exists")

    await db.query(createCommentsTable)
    console.log("Comments table created or already exists")

    await db.query(createBookmarksTable)
    console.log("Bookmarks table created or already exists")

    console.log("Database setup completed successfully")
  } catch (error) {
    console.error("Database setup error:", error)
  } finally {
    // Close database connection
    process.exit(0)
  }
}

// Run the setup
setupDatabase()
