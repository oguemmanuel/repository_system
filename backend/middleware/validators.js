const validateRegistration = (req, res, next) => {
  const { username, email, password, fullName, role, department } = req.body

  // Check required fields
  if (!username || !email || !password || !fullName) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: username, email, password, fullName",
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    })
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long",
    })
  }

  // Validate role if provided
  if (role && !["student", "supervisor", "admin", "faculty"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role. Must be one of: student, supervisor, admin, faculty",
    })
  }

  // Validate department if role is supervisor
  if (role === "supervisor" && !department) {
    return res.status(400).json({
      success: false,
      message: "Department is required for supervisors",
    })
  }

  next()
}

// Validation middleware for user login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body

  // Check required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email and password",
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    })
  }

  next()
}

// Validation middleware for resource upload
const validateResourceUpload = (req, res, next) => {
  const { title, description, type, department } = req.body

  // Check required fields
  if (!title || !description || !type || !department) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: title, description, type, department",
    })
  }

  // Validate resource type
  const validTypes = ["mini-project", "final-project", "past-exam", "thesis"]
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid resource type. Must be one of: mini-project, final-project, past-exam, thesis",
    })
  }

  // If it's a final project, ensure supervisor is specified
  if (type === "final-project" && !req.body.supervisorId && !req.body.supervisorName) {
    return res.status(400).json({
      success: false,
      message: "Supervisor is required for final year projects",
    })
  }

  next()
}

// Validation middleware for resource approval/rejection
const validateResourceAction = (req, res, next) => {
  const { status, rejectionReason } = req.body

  if (!status || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be 'approved' or 'rejected'",
    })
  }

  // If rejecting, require a reason
  if (status === "rejected" && !rejectionReason) {
    return res.status(400).json({
      success: false,
      message: "Rejection reason is required when rejecting a resource",
    })
  }

  next()
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateResourceUpload,
  validateResourceAction,
}
