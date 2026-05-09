/**
 * @file error.middleware.js — Centralized Error Handler
 *
 * SINGLE RESPONSIBILITY:
 *   ALL errors in the app land here via next(err). This middleware formats
 *   them into a consistent JSON response and sends it to the client.
 *
 * WHY THIS EXISTS:
 *   Without centralized error handling, each controller formats its own
 *   error responses — leading to inconsistency, leaked stack traces,
 *   and missed edge cases. This middleware handles everything in one place.
 *
 * WHAT IT HANDLES:
 *   - Operational errors (err.statusCode is set by the thrower)
 *   - Mongoose ValidationError → 422 (schema validation failures)
 *   - Mongoose CastError → 400 (invalid ObjectId, etc.)
 *   - Mongoose duplicate key error → 409 (code 11000)
 *   - JWT errors → 401 (JsonWebTokenError, TokenExpiredError)
 *   - Firebase Auth errors → 401 (id-token-expired, revoked, etc.)
 *   - JSON SyntaxError → 400 (malformed request body)
 *   - Unknown/unexpected errors → 500 (fallback)
 *
 * RESPONSE SHAPE (always):
 *   {
 *     success: false,
 *     message: string,
 *     statusCode: number,
 *     errors?: [{ field, message }]   — present on validation failures
 *     stack?: string                   — present only in development
 *   }
 *
 * SECURITY:
 *   Stack traces are NEVER sent in production. Only in development.
 *
 * NOTE:
 *   Express recognizes this as an error handler because it has 4 params.
 *   It MUST be registered AFTER all routes in app.js.
 */

const env = require('../config/env');
const logger = require('../shared/utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // ── Default values ──
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // ── JSON SyntaxError ──
  // Triggered when a client sends malformed JSON in the request body.
  // Express's JSON parser throws a SyntaxError with a `status` property.
  // Without this, malformed JSON falls through as a 500.
  if (err.type === 'entity.parse.failed') {
    err.statusCode = 400;
    err.message = 'Invalid JSON in request body. Please check your request format.';
  }

  // ── Mongoose: Validation Error ──
  // Triggered when a document fails schema validation (e.g. required field missing).
  // 422 Unprocessable Entity: the request format is correct but content is invalid.
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    err.statusCode = 422;
    err.message = messages.join('. ');
  }

  // ── Mongoose: Cast Error ──
  // Triggered when an invalid value is passed for a field type (e.g. bad ObjectId).
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── Mongoose: Duplicate Key Error ──
  // Triggered when a unique-indexed field gets a duplicate value.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    err.statusCode = 409;
    err.message = `Duplicate value for field: ${field}. Please use a different value.`;
  }

  // ── JWT: Invalid Token ──
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token. Please log in again.';
  }

  // ── JWT: Expired Token ──
  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Token has expired. Please log in again.';
  }

  // ── Firebase Auth Errors ──
  // Firebase Admin SDK errors have a `codePrefix` of 'auth' and
  // a `code` like 'auth/id-token-expired', 'auth/argument-error', etc.
  // These can bubble up from auth.middleware.js or auth.routes.js.
  if (err.codePrefix === 'auth' || (err.code && String(err.code).startsWith('auth/'))) {
    const firebaseCode = err.code || '';
    if (firebaseCode.includes('id-token-expired')) {
      err.statusCode = 401;
      err.message = 'Authentication token has expired. Please log in again.';
    } else if (firebaseCode.includes('id-token-revoked')) {
      err.statusCode = 401;
      err.message = 'Authentication token has been revoked. Please log in again.';
    } else if (firebaseCode.includes('user-not-found')) {
      err.statusCode = 404;
      err.message = 'Firebase user not found.';
    } else if (firebaseCode.includes('argument-error')) {
      err.statusCode = 400;
      err.message = 'Invalid authentication token format.';
    } else {
      err.statusCode = err.statusCode && err.statusCode !== 500 ? err.statusCode : 401;
      err.message = err.message || 'Authentication failed.';
    }
  }

  // ── Build response ──
  const response = {
    success: false,
    message: err.message,
    statusCode: err.statusCode,
  };

  // Include field-level validation errors when present
  // (set by validation.middleware.js — enables per-field form feedback on frontend)
  if (err.validationErrors) {
    response.errors = err.validationErrors;
  }

  // Include stack trace only in development (never in production)
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Log unexpected errors (500s) for debugging — uses shared logger, not console
  if (err.statusCode === 500) {
    logger.error(`Unhandled error: ${err.message}`, err.stack);
  }

  res.status(err.statusCode).json(response);
};

module.exports = errorHandler;
