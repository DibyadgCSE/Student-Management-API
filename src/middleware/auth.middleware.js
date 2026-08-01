const jwt = require('jsonwebtoken');
const db = require('../config/database');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to authenticate a user via JWT.
 * It checks the 'jwt' cookie first, then falls back to the Authorization header (Bearer token).
 */
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for token in cookies or headers
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'You are not logged in. Please log in to get access.');
  }

  // 2. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists in database
    const userResult = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    
    if (userResult.rows.length === 0) {
      throw new ApiError(401, 'The user belonging to this token no longer exists.');
    }

    // 4. Attach user to the request object
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token. Please log in again.');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your token has expired. Please log in again.');
    }
    throw error;
  }
});

/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER the authenticate middleware.
 * @param  {...string} roles - Array of allowed roles (e.g., 'admin', 'student')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
