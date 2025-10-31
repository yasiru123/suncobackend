const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware to verify JWT token
 * Attaches user object to req.user if valid
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided. Authorization denied.' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error: JWT_SECRET is not set.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found. Authorization denied.' 
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token. Authorization denied.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired. Please refresh your token.' 
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during authentication.' 
    });
  }
};

/**
 * Optional auth middleware - doesn't fail if no token
 * Used for endpoints that work with or without auth
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (user) {
      req.user = user;
      req.userId = user._id;
    }

    next();
  } catch (error) {
    // Silently continue without auth
    next();
  }
};

module.exports = { auth, optionalAuth };


