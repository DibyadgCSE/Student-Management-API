/**
 * Custom Error class for operational errors.
 * Used to throw formatted HTTP errors (e.g., 404 Not Found, 400 Bad Request).
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP Status Code (e.g., 400, 401, 403, 404, 500)
   * @param {string} message - Error description
   * @param {Array} errors - Optional array of specific validation errors or details
   * @param {string} stack - Optional stack trace
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
