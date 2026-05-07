/**
 * @file Application Constants
 * @description Centralized enums and magic values used across the app.
 *
 * WHY THIS EXISTS:
 * - Eliminates magic strings and numbers scattered through controllers/services.
 * - Makes refactoring safer — change a value here, it updates everywhere.
 * - Serves as living documentation of valid values (roles, statuses, etc.).
 *
 * HOW TO EXTEND:
 * - Add new enums as frozen objects below.
 * - Import only what you need: const { UserRoles } = require('../constants');
 */

/**
 * Standard HTTP status codes used in API responses.
 * Only the ones we actually use — not the full spec.
 */
const HttpStatus = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER: 500,
});

/**
 * User roles for role-based access control (RBAC).
 * Will be referenced in auth middleware and user model.
 */
const UserRoles = Object.freeze({
  STUDENT: 'student',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
});

/**
 * Common response messages reused across controllers.
 */
const ResponseMessages = Object.freeze({
  SUCCESS: 'Success',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',
  INTERNAL_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION_ERROR: 'Validation failed',
});

module.exports = {
  HttpStatus,
  UserRoles,
  ResponseMessages,
};
