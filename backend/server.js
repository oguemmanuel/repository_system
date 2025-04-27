const express = require("express")
const session = require("express-session")
const cors = require("cors")
const MySQLStore = require("express-mysql-session")(session)
const dotenv = require("dotenv")
const path = require("path")
const fs = require("fs")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth")
const resourceRoutes = require("./routes/resources")
const userRoutes = require("./routes/users")
const analyticsRoutes = require("./routes/analitics")
const notificationRoutes = require("./routes/notifications")
const commentRoutes = require("./routes/comments")

// Database connection
const db = require("./config/database")

// Create Express app
const app = express()
const PORT = process.env.PORT || 5000

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("Created uploads directory:", uploadsDir)
}

// Session store options
const sessionStoreOptions = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cug_repository",
}

// Create session store
const sessionStore = new MySQLStore(sessionStoreOptions)

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session middleware
app.use(
  session({
    key: "session_cookie_name",
    secret: process.env.SESSION_SECRET || "session_secret_key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/users", userRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/comments", commentRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
})
