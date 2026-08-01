const db = require('../config/database');
const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth.utils');

/**
 * Register a new user in the database.
 * @param {Object} userData - { name, email, password, role }
 * @returns {Object} { user, token }
 */
const registerUser = async (userData) => {
  const { name, email, password, role = 'student' } = userData;

  // 1. Check if the user already exists
  const existingUserResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existingUserResult.rows.length > 0) {
    throw new ApiError(400, 'User with this email already exists');
  }

  // 2. Hash the password
  const hashedPassword = await hashPassword(password);

  // 3. Insert the new user into the database
  const insertQuery = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  const newUserResult = await db.query(insertQuery, [name, email, hashedPassword, role]);
  const user = newUserResult.rows[0];

  // 4. Generate JWT token
  const token = generateToken({ id: user.id, role: user.role });

  return { user, token };
};

/**
 * Login an existing user.
 * @param {string} email 
 * @param {string} password 
 * @returns {Object} { user, token }
 */
const loginUser = async (email, password) => {
  // 1. Check if the user exists
  const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const user = userResult.rows[0];

  // 2. Verify password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // 3. Generate JWT token
  const token = generateToken({ id: user.id, role: user.role });

  // Remove the password field before returning the user object
  delete user.password;

  return { user, token };
};

module.exports = {
  registerUser,
  loginUser,
};
