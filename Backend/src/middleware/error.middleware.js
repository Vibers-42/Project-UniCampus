/**
 * @file Centralized Error Handling Middleware
 * @description Catches all errors thrown/forwarded in the request pipeline
 *              and returns a consistent JSON response.
 *
 * WHY THIS EXISTS:
 * - Without centralized error handling, each controller would need to format
 *   its own error responses — leading to inconsistency.
 * - This middleware distinguishes between known errors (ApiError) and
 *   unexpected errors, logging full details for the latter.
 * - In production, stack traces are hidden from the client for security.
 *
 * HOW IT WORKS:
 * - Express recognizes this as an error handler because it has 4 parameters.
 * - It must be registered AFTER all routes in app.js.
 */

const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { HttpStatus } = require('../constants');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // ── If it's our custom ApiError, use its properties ──
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      // Show stack trace only in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // ── Handle Mongoose validation errors ──
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation failed',
      errors,
    });
  }

  // ── Handle Mongoose duplicate key errors ──
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    return res.status(HttpStatus.CONFLICT).json({
      success: false,
      statusCode: HttpStatus.CONFLICT,
      message: `Duplicate value for field: ${field}`,
      errors: [],
    });
  }

  // ── Unknown / unexpected errors ──
  logger.error('Unhandled error:', err);

  return res.status(HttpStatus.INTERNAL_SERVER).json({
    success: false,
    statusCode: HttpStatus.INTERNAL_SERVER,
    message: 'Something went wrong. Please try again later.',
    errors: [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
