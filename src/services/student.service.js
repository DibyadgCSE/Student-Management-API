const db = require('../config/database');
const ApiError = require('../utils/ApiError');

const createStudent = async (studentData) => {
  const { userId, studentCode, department, cgpa = null, enrollmentYear, status = 'active' } = studentData;

  // 1. Verify user exists and is not already a student
  const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (userCheck.rows.length === 0) {
    throw new ApiError(404, 'User not found');
  }

  const existingStudentCheck = await db.query('SELECT * FROM students WHERE user_id = $1', [userId]);
  if (existingStudentCheck.rows.length > 0) {
    throw new ApiError(400, 'This user already has a student profile');
  }

  // 2. Insert into students table
  const insertQuery = `
    INSERT INTO students (user_id, student_code, department, cgpa, enrollment_year, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const result = await db.query(insertQuery, [userId, studentCode, department, cgpa, enrollmentYear, status]);
  
  return result.rows[0];
};

const getStudents = async (queryParams) => {
  const { 
    page = 1, 
    limit = 10, 
    sort_by = 'created_at', 
    sort_order = 'desc',
    department,
    status,
    search
  } = queryParams;

  const offset = (page - 1) * limit;
  
  let baseQuery = `
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE 1=1
  `;
  
  const queryValues = [];
  let paramIndex = 1;

  // Filter by department
  if (department) {
    baseQuery += ` AND s.department = $${paramIndex}`;
    queryValues.push(department);
    paramIndex++;
  }

  // Filter by status
  if (status) {
    baseQuery += ` AND s.status = $${paramIndex}`;
    queryValues.push(status);
    paramIndex++;
  }

  // Search by name, email, or student_code
  if (search) {
    baseQuery += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR s.student_code ILIKE $${paramIndex})`;
    queryValues.push(`%${search}%`);
    paramIndex++;
  }

  // Count total items for pagination metadata
  const countQuery = `SELECT COUNT(*) ${baseQuery}`;
  const countResult = await db.query(countQuery, queryValues);
  const totalItems = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(totalItems / limit);

  // Allowed sort fields to prevent SQL injection
  const allowedSortFields = {
    'created_at': 's.created_at',
    'cgpa': 's.cgpa',
    'enrollment_year': 's.enrollment_year',
    'student_code': 's.student_code'
  };
  
  const sortColumn = allowedSortFields[sort_by] || 's.created_at';
  const sortDir = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const dataQuery = `
    SELECT 
      s.id, s.user_id, s.student_code, s.department, s.cgpa, s.enrollment_year, s.status, s.created_at,
      u.name, u.email
    ${baseQuery}
    ORDER BY ${sortColumn} ${sortDir}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  
  queryValues.push(limit, offset);
  const dataResult = await db.query(dataQuery, queryValues);

  return {
    data: dataResult.rows,
    meta: {
      totalItems,
      totalPages,
      currentPage: parseInt(page, 10),
      limit: parseInt(limit, 10)
    }
  };
};

const getStudentById = async (id) => {
  const query = `
    SELECT 
      s.*, 
      u.name, u.email 
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = $1
  `;
  const result = await db.query(query, [id]);
  
  if (result.rows.length === 0) {
    throw new ApiError(404, 'Student not found');
  }
  
  return result.rows[0];
};

const updateStudent = async (id, updateData) => {
  const { department, cgpa, status } = updateData;
  
  // First check if student exists
  await getStudentById(id);

  // Dynamically build the update query
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (department !== undefined) {
    updates.push(`department = $${paramIndex}`);
    values.push(department);
    paramIndex++;
  }
  if (cgpa !== undefined) {
    updates.push(`cgpa = $${paramIndex}`);
    values.push(cgpa);
    paramIndex++;
  }
  if (status !== undefined) {
    updates.push(`status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  if (updates.length === 0) {
    throw new ApiError(400, 'No fields provided for update');
  }

  values.push(id);
  const query = `
    UPDATE students
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *;
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteStudent = async (id) => {
  // Check if exists
  await getStudentById(id);

  // Because of ON DELETE CASCADE on user_id, deleting the student profile 
  // does not delete the user account. But if we deleted the user account, 
  // the student profile would be deleted.
  // Here we just delete the student profile.
  const query = 'DELETE FROM students WHERE id = $1 RETURNING id;';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
