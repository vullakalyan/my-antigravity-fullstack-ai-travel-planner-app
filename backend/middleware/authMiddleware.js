'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT Bearer tokens and inject user context into req.user.
 * On failure, responds with 401 using the standard error response shape.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Validate Authorization header format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. No authentication token provided.',
          code: 'TOKEN_MISSING',
        },
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token.trim() === '') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. Token is empty.',
          code: 'TOKEN_EMPTY',
        },
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication token has expired. Please log in again.',
            code: 'TOKEN_EXPIRED',
          },
        });
      }
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication token is invalid.',
          code: 'TOKEN_INVALID',
        },
      });
    }

    // Verify the user still exists in the database
    const user = await User.findById(decoded.id).select('_id email name');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'The user associated with this token no longer exists.',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    // Inject user context — downstream handlers use req.user.id
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { protect };
