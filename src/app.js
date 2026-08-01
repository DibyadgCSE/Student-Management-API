const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const setupSwagger = require('./docs/swagger');

const app = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// 3. HTTP Request Logging (Combined format for production, dev format for development)
const loggerFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(loggerFormat));

// 4. Body Parsing Middlewares
app.use(express.json({ limit: '10kb' })); // Parse JSON payloads, payload limit set to 10kb to prevent DOS
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded bodies

// 5. Cookie Parser Middleware
app.use(cookieParser());

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Student Management API is running healthy',
    timestamp: new Date().toISOString(),
  });
});

// Setup Swagger Documentation
setupSwagger(app);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);

// Catch-all for undefined routes (404)
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
