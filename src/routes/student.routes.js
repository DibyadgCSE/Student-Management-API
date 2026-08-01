const express = require('express');
const studentController = require('../controllers/student.controller');
const { 
  createStudentValidator, 
  updateStudentValidator, 
  getStudentValidator, 
  getStudentsQueryValidator 
} = require('../validators/student.validator');
const validate = require('../validators/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes below
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management operations
 */

/**
 * @swagger
 * /api/v1/students:
 *   post:
 *     summary: Create a new student (Admin Only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - studentCode
 *               - department
 *               - enrollmentYear
 *             properties:
 *               userId:
 *                 type: string
 *               studentCode:
 *                 type: string
 *               department:
 *                 type: string
 *               cgpa:
 *                 type: number
 *               enrollmentYear:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Student profile created successfully
 */
router.post(
  '/', 
  authorize('admin'), 
  createStudentValidator, 
  validate, 
  studentController.createStudent
);

/**
 * @swagger
 * /api/v1/students:
 *   get:
 *     summary: Get all students with pagination and filtering
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or student code
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 */
router.get(
  '/', 
  getStudentsQueryValidator, 
  validate, 
  studentController.getStudents
);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID (UUID)
 *     responses:
 *       200:
 *         description: Student retrieved successfully
 *       404:
 *         description: Student not found
 */
router.get(
  '/:id', 
  getStudentValidator, 
  validate, 
  studentController.getStudentById
);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   put:
 *     summary: Update a student profile (Admin Only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *               cgpa:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student profile updated successfully
 */
router.put(
  '/:id', 
  authorize('admin'), 
  updateStudentValidator, 
  validate, 
  studentController.updateStudent
);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   delete:
 *     summary: Delete a student profile (Admin Only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student profile deleted successfully
 */
router.delete(
  '/:id', 
  authorize('admin'), 
  getStudentValidator, 
  validate, 
  studentController.deleteStudent
);

module.exports = router;
