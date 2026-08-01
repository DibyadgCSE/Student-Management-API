const { body, param, query } = require('express-validator');

const createStudentValidator = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isUUID().withMessage('User ID must be a valid UUID'),
  body('studentCode')
    .trim()
    .notEmpty().withMessage('Student Code is required')
    .isLength({ max: 20 }).withMessage('Student Code cannot exceed 20 characters'),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required')
    .isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters'),
  body('cgpa')
    .optional()
    .isFloat({ min: 0.00, max: 4.00 }).withMessage('CGPA must be between 0.00 and 4.00'),
  body('enrollmentYear')
    .notEmpty().withMessage('Enrollment Year is required')
    .isInt({ min: 2000, max: 2100 }).withMessage('Enrollment Year must be a valid year'),
  body('status')
    .optional()
    .isIn(['active', 'graduated', 'suspended']).withMessage('Invalid status'),
];

const updateStudentValidator = [
  param('id').isUUID().withMessage('Invalid Student ID format'),
  body('department')
    .optional()
    .trim()
    .notEmpty().withMessage('Department cannot be empty')
    .isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters'),
  body('cgpa')
    .optional()
    .isFloat({ min: 0.00, max: 4.00 }).withMessage('CGPA must be between 0.00 and 4.00'),
  body('status')
    .optional()
    .isIn(['active', 'graduated', 'suspended']).withMessage('Invalid status'),
];

const getStudentValidator = [
  param('id').isUUID().withMessage('Invalid Student ID format'),
];

// Validating query parameters for pagination, sorting, and filtering
const getStudentsQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort_by').optional().isIn(['created_at', 'cgpa', 'enrollment_year', 'student_code']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('department').optional().trim(),
  query('status').optional().isIn(['active', 'graduated', 'suspended']).withMessage('Invalid status filter'),
  query('search').optional().trim(),
];

module.exports = {
  createStudentValidator,
  updateStudentValidator,
  getStudentValidator,
  getStudentsQueryValidator,
};
