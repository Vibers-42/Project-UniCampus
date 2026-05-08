/**
 * @file notFound.middleware.js — 404 Route Catcher
 *
 * SINGLE RESPONSIBILITY:
 *   Catches any request that didn't match a defined route and creates
 *   a proper error, then passes it to the centralized error handler
 *   via next(err).
 *
 * WHY THIS EXISTS:
 *   Without this, Express returns its default HTML 404 page — useless
 *   for API clients expecting JSON. This middleware ensures every
 *   unmatched route gets a consistent JSON error response.
 *
 * PLACEMENT:
 *   Must be registered AFTER all valid routes but BEFORE error.middleware.
 *
 * NOTE:
 *   This middleware does NOT send a response directly. It creates an
 *   error and forwards it to error.middleware.js, keeping all response
 *   formatting in one place.
 */

const AppError = require('../shared/utils/AppError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = notFoundHandler;
