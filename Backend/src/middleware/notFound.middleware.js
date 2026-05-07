/**
 * @file 404 Not Found Middleware
 * @description Catches requests to undefined routes and returns a JSON 404.
 *
 * WHY THIS EXISTS:
 * - Without this, Express returns its default HTML 404 page, which is
 *   useless for an API client expecting JSON.
 * - Must be registered AFTER all valid routes but BEFORE the error handler.
 */

const ApiError = require('../utils/ApiError');
const { HttpStatus } = require('../constants');

const notFoundHandler = (req, res, next) => {
  next(new ApiError(HttpStatus.NOT_FOUND, `Route not found: ${req.originalUrl}`));
};

module.exports = notFoundHandler;
