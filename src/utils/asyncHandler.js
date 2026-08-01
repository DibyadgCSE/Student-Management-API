/**
 * Wrapper for asynchronous Express route handlers (controllers).
 * Eliminates the need for repetitive try-catch blocks.
 * Automatically catches promise rejections and passes them to the next() error handler.
 * 
 * @param {Function} requestHandler - The async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

module.exports = asyncHandler;
