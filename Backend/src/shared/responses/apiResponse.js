/**
 * @file apiResponse.js — Standardized API Response Helpers
 *
 * SINGLE RESPONSIBILITY:
 *   Provides two functions to send consistent JSON responses from every
 *   controller. No controller in this app calls res.json() directly —
 *   they all go through sendSuccess or sendError.
 *
 * RESPONSE SHAPE (always):
 *   Success: { success: true,  statusCode, data, message }
 *   Error:   { success: false, statusCode, message }
 *
 * WHY THIS EXISTS:
 *   The frontend should never have to guess the response structure.
 *   Every endpoint returns the same shape. Refactoring the shape
 *   means changing only this file.
 *
 * USAGE:
 *   const { sendSuccess, sendError } = require('../shared/responses/apiResponse');
 *
 *   // In a controller:
 *   sendSuccess(res, userData, 'User fetched successfully');
 *   sendSuccess(res, newUser, 'User created', 201);
 *
 *   // Errors are usually thrown and caught by error.middleware,
 *   // but sendError is available for edge cases:
 *   sendError(res, 'Something went wrong', 500);
 */

/**
 * Send a success response.
 *
 * @param {Object} res        — Express response object
 * @param {*}      data       — Response payload (object, array, null, etc.)
 * @param {string} [message]  — Human-readable message (default: 'Success')
 * @param {number} [statusCode] — HTTP status code (default: 200)
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    data,
    message,
  });
};

/**
 * Send an error response.
 *
 * NOTE: Most errors are thrown and handled by error.middleware.js.
 *       This function exists for cases where a controller needs to
 *       send an error response without throwing (rare).
 *
 * @param {Object} res        — Express response object
 * @param {string} [message]  — Error message (default: 'Something went wrong')
 * @param {number} [statusCode] — HTTP status code (default: 500)
 */
const sendError = (res, message = 'Something went wrong', statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
