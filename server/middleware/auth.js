const jwt = require('jsonwebtoken');
const AuthUser = require('../models/AuthUser');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.header('x-auth-token')) {
      token = req.header('x-auth-token');
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. No token provided.'
      });
    }

    try {
      // Special handling for admin-token (for demo purposes)
      if (token === 'admin-token') {
        req.user = {
          _id: 'admin',
          username: 'admin',
          email: 'admin@agribasket.com',
          role: 'admin',
          isAdmin: true,
          isActive: true
        };
        return next();
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from AuthUser
      let user = await AuthUser.findById(decoded.userId || decoded.id).select('+isActive');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized. User not found.'
        });
      }

      // Check if user is active (different field names for different models)
      const isActive = user.isActive !== undefined ? user.isActive : user.accountStatus?.isActive;
      if (!isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated. Please contact support.'
        });
      }

      // Check if user is blocked
      const isBlocked = user.isBlocked !== undefined ? user.isBlocked : user.accountStatus?.isBanned;
      if (isBlocked) {
        return res.status(401).json({
          success: false,
          message: `Account has been blocked. Reason: ${user.blockReason || 'Policy violation'}`
        });
      }

      // Check if account is locked (AuthUser specific)
      if (user.isLocked) {
        return res.status(401).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
        });
      }

      // Update last active for User
      if (user.activity) {
        user.activity.lastActiveAt = new Date();
        await user.save();
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid token.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

// Optional authentication - get user if token is provided
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from AuthUser
        let user = await AuthUser.findById(decoded.userId || decoded.id);

        const isActive = user?.isActive !== undefined ? user.isActive : user?.accountStatus?.isActive;
        const isBlocked = user?.isBlocked !== undefined ? user.isBlocked : user?.accountStatus?.isBanned;

        if (user && isActive && !isBlocked && !user.isLocked) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        console.log('Optional auth: Invalid token provided');
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Require email verification
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const isEmailVerified = req.user.isEmailVerified !== undefined ? 
    req.user.isEmailVerified : req.user.accountStatus?.isEmailVerified;

  if (!isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email address to continue.',
      requireEmailVerification: true
    });
  }

  next();
};

// Admin only access
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Owner or admin access (for profile updates, etc.)
const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const resourceUserId = req.params.userId || req.params.id;
  const isOwner = req.user._id.toString() === resourceUserId;
  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  }

  next();
};

// Get client IP address
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         'unknown';
};

// Legacy middleware for backward compatibility
const authMiddleware = protect;

// Permission-based authorization
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  requireEmailVerification,
  adminOnly,
  ownerOrAdmin,
  getClientIP,
  authMiddleware: protect, // For backward compatibility
  adminMiddleware: adminOnly, // For admin-specific routes
  checkPermission
};
