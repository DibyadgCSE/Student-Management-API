const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Configure cookie options for JWT tokens.
 * HTTP-only cookies prevent XSS attacks from stealing tokens.
 */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

/**
 * Handle user registration
 */
const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);

  // Send token in an HTTP-only cookie
  res.cookie('jwt', token, cookieOptions);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user, token }, // Token is also returned in body for non-browser clients (e.g., mobile apps)
  });
});

/**
 * Handle user login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser(email, password);

  // Send token in an HTTP-only cookie
  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    data: { user, token },
  });
});

/**
 * Handle user logout
 */
const logout = asyncHandler(async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    ...cookieOptions,
    maxAge: 10 * 1000, // Expire very quickly
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
});

module.exports = {
  register,
  login,
  logout,
};
