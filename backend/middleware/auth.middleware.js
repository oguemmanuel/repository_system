const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
  
  const isAdmin = (req, res, next) => {
    if (req.session.userType === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
  
  const isSupervisor = (req, res, next) => {
    if (req.session.userType === 'supervisor') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
  
  module.exports = {
    isAuthenticated,
    isAdmin,
    isSupervisor
  };