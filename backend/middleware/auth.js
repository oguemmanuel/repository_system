const getUserFromSession = (req) => req.session?.user || null;

const isAuthenticated = (req, res, next) => {
  const user = getUserFromSession(req);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  req.user = user; // optional but helpful
  next();
};

// Authorization middleware
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

// Admin-only middleware
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

// Supervisor or admin middleware
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
};
