/**
 * @file AppError.js — Application Error Class
 *
 * SINGLE RESPONSIBILITY:
 *   A lightweight Error subclass that carries an HTTP status code.
 *   Replaces the 3-line error creation pattern used 30+ times across
 *   the codebase with a single throw statement.
 *
 * BEFORE:
 *   const err = new Error('Resource not found');
 *   err.statusCode = 404;
 *   throw err;
 *
 * AFTER:
 *   throw new AppError('Resource not found', 404);
 *
 * WHY THIS ISN'T OVERENGINEERING:
 *   - One class, one constructor, zero inheritance tree
 *   - No error codes, no error registry, no error hierarchy
 *   - Just {message, statusCode} — same shape the error middleware expects
 *
 * USAGE:
 *   const AppError = require('../../shared/utils/AppError');
 *   throw new AppError('Not found', 404);
 *   throw new AppError('Unauthorized', 401);
 *   throw new AppError('Email already exists', 409);
 */

class AppError extends Error {
  /**
   * @param {string} message    — Human-readable error message
   * @param {number} statusCode — HTTP status code (4xx or 5xx)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
