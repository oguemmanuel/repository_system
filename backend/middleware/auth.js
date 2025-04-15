const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    })
  }

  next()
}

// Authorization middleware
const isAuthorized = (roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      })
    }

    next()
  }
}

// Admin-only middleware
const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    })
  }

  next()
}

// Supervisor or admin middleware
const isSupervisorOrAdmin = (req, res, next) => {
  if (!req.session.user || (req.session.user.role !== "supervisor" && req.session.user.role !== "admin")) {
    return res.status(403).json({
      success: false,
      message: "Supervisor or admin access required",
    })
  }

  next()
}

module.exports = {
  isAuthenticated,
  isAuthorized,
  isAdmin,
  isSupervisorOrAdmin,
}
