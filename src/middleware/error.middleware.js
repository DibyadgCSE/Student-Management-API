const ApiError = require('../utils/ApiError');

/**
 * Global Error Handling Middleware for Express
 * Captures all errors passed to next(err) and formats them into a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  // Let default error handler manage it if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  let error = err;

  // If the error is not an instance of our custom ApiError, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ? error.statusCode : 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  // Handle specific database errors (e.g. unique constraint violations)
  if (err.code === '23505') {
    // PostgreSQL unique violation error code
    const message = 'Duplicate field value entered';
    error = new ApiError(400, message, [], err.stack);
  }

  // Prepare response payload
  const response = {
    success: false,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    // Include stack trace only in development mode for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  // Send the formatted error response
  res.status(error.statusCode).json(response);
};

// Middleware for handling 404 Not Found (Routes that do not exist)
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error); // Pass to the global errorHandler
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
