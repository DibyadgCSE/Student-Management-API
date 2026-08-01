const studentService = require('../services/student.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new student profile
 * @route   POST /api/v1/students
 * @access  Private/Admin
 */
const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Student profile created successfully',
    data: student,
  });
});

/**
 * @desc    Get all students with pagination, sorting, and filtering
 * @route   GET /api/v1/students
 * @access  Private
 */
const getStudents = asyncHandler(async (req, res) => {
  const result = await studentService.getStudents(req.query);
  
  res.status(200).json({
    success: true,
    message: 'Students retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

/**
 * @desc    Get a single student by ID
 * @route   GET /api/v1/students/:id
 * @access  Private
 */
const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Student retrieved successfully',
    data: student,
  });
});

/**
 * @desc    Update a student profile
 * @route   PUT /api/v1/students/:id
 * @access  Private/Admin
 */
const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  
  res.status(200).json({
    success: true,
    message: 'Student profile updated successfully',
    data: student,
  });
});

/**
 * @desc    Delete a student profile
 * @route   DELETE /api/v1/students/:id
 * @access  Private/Admin
 */
const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.deleteStudent(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Student profile deleted successfully',
    data: {},
  });
});

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
