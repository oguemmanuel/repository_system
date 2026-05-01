const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

const getUserFromSession = (req) => {
  // Try JWT token first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (err) {
      // Invalid token, fall through to session
    }
  }
  // Fall back to session
  return req.session?.user || null;
};

const isAuthenticated = (req, res, next) => {
  const user = getUserFromSession(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  req.user = user;
  next();
};

const isAuthorized = (roles) => {
  return (req, res, next) => {
    const user = getUserFromSession(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }
    req.user = user;
    next();
  };
};

const isAdmin = (req, res, next) => {
  const user = getUserFromSession(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  req.user = user;
  next();
};

const isSupervisorOrAdmin = (req, res, next) => {
  const user = getUserFromSession(req);
  if (!user || (user.role !== "supervisor" && user.role !== "admin")) {
    return res.status(403).json({
      success: false,
      message: "Supervisor or admin access required",
    });
  }
  req.user = user;
  next();
};

module.exports = {
  isAuthenticated,
  isAuthorized,
  isAdmin,
  isSupervisorOrAdmin,
  JWT_SECRET,
};
