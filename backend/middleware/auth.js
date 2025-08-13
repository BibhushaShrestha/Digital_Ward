import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      // Check if user is active
      if (!req.user.isActive) {
        res.status(401);
        throw new Error('User account is deactivated');
      }

      // Check if user is blocked
      if (req.user.isBlocked) {
        res.status(401);
        throw new Error('User account is blocked');
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Authorize roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, no user');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role ${req.user.role} is not authorized to access this route`);
    }

    next();
  };
};

// Check specific permissions
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, no user');
    }

    if (!req.user.permissions.includes(permission)) {
      res.status(403);
      throw new Error(`User does not have permission: ${permission}`);
    }

    next();
  };
};

// Check multiple permissions (any of them)
export const checkAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, no user');
    }

    const hasPermission = permissions.some(permission => 
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      res.status(403);
      throw new Error(`User does not have any of the required permissions: ${permissions.join(', ')}`);
    }

    next();
  };
};

// Check multiple permissions (all of them)
export const checkAllPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, no user');
    }

    const hasAllPermissions = permissions.every(permission => 
      req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      res.status(403);
      throw new Error(`User does not have all required permissions: ${permissions.join(', ')}`);
    }

    next();
  };
};

// Ward access control
export const checkWardAccess = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, no user');
  }

  // Admin and staff can access all wards
  if (req.user.role === 'admin' || req.user.role === 'staff') {
    return next();
  }

  // Citizens can only access their own ward
  const requestedWard = req.params.ward || req.body.ward || req.query.ward;
  
  if (requestedWard && req.user.address.ward !== parseInt(requestedWard)) {
    res.status(403);
    throw new Error('Access denied: You can only access your own ward');
  }

  next();
};

// Optional authentication - doesn't throw error if no token
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Don't throw error, just continue without user
      req.user = null;
    }
  }

  next();
});

// Rate limiting for authentication attempts
export const authRateLimit = (req, res, next) => {
  // This would typically be implemented with a rate limiting library
  // For now, we'll just pass through
  next();
};

// Check if user is verified
export const requireVerification = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, no user');
  }

  // For email-based login
  if (req.user.email && !req.user.isEmailVerified) {
    res.status(403);
    throw new Error('Email not verified. Please verify your email address.');
  }

  // For mobile-based login
  if (req.user.mobileNumber && !req.user.isMobileVerified) {
    res.status(403);
    throw new Error('Mobile number not verified. Please verify your mobile number.');
  }

  next();
};

// Check if user can access sensitive data
export const checkSensitiveDataAccess = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, no user');
  }

  // Only admin and staff can access sensitive data
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    res.status(403);
    throw new Error('Access denied: Insufficient privileges for sensitive data');
  }

  next();
};

// Log user activity
export const logActivity = (activity) => {
  return async (req, res, next) => {
    if (req.user) {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          lastActivityAt: new Date()
        });
        
        // Here you could also log to a separate activity log collection
        console.log(`User ${req.user._id} performed activity: ${activity}`);
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    }
    next();
  };
};
