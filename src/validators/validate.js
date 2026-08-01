const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to execute express-validator checks.
 * If validation fails, it extracts the errors and throws an ApiError (400 Bad Request)
 * which is caught by the global error handler.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  // Format express-validator errors into a simpler array of objects
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  throw new ApiError(400, 'Validation failed', extractedErrors);
};

module.exports = validate;
