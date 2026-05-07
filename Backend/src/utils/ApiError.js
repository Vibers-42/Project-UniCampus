/**
 * @file Custom API Error Class
 * @description Extends the native Error to include HTTP status codes and
 *              structured error data.
 *
 * WHY THIS EXISTS:
 * - Native Error objects don't carry status codes — we need them for the
 *   centralized error handler to know what HTTP status to respond with.
 * - The `errors` array supports field-level validation errors (e.g., from
 *   Joi or Zod), so the frontend can display per-field messages.
 * - The `success: false` flag keeps response shape consistent with ApiResponse.
 *
 * USAGE:
 *   throw new ApiError(404, 'User not found');
 *   throw new ApiError(400, 'Validation failed', [{ field: 'email', message: 'Required' }]);
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} [message='Something went wrong'] - Error message
   * @param {Array} [errors=[]] - Additional error details (e.g., validation errors)
   * @param {string} [stack=''] - Optional stack trace override
   */
  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    stack = ''
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
