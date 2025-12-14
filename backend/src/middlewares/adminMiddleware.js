// FILE: backend/src/middlewares/adminMiddleware.js
module.exports = (req, res, next) => {
  // Check if user exists (authMiddleware should run first)
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if user is admin
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Access denied. Admin privileges required.',
      yourRole: req.user.role
    });
  }

  next();
};