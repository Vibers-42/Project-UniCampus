/**
 * @file catchAsync — Async Controller Wrapper
 *
 * SINGLE RESPONSIBILITY:
 *   Wraps any async route handler (controller) so that rejected promises
 *   are automatically forwarded to Express's error-handling middleware
 *   via next(err).
 *
 * WHY THIS EXISTS:
 *   Without this, every async controller needs its own try/catch block.
 *   Forgetting one causes an unhandled promise rejection and crashes.
 *   This wrapper eliminates that boilerplate entirely.
 *
 * HOW IT WORKS:
 *   catchAsync takes an async function and returns a new function.
 *   The returned function calls the original. If the promise rejects,
 *   the error is passed to next() — landing in error.middleware.js.
 *
 * USAGE:
 *   const catchAsync = require('../middleware/catchAsync');
 *
 *   const getUsers = catchAsync(async (req, res) => {
 *     const users = await userService.findAll();
 *     sendSuccess(res, users, 'Users fetched');
 *   });
 *
 * RULE:
 *   No controller in this app uses try/catch. catchAsync is the ONLY
 *   async error handling pattern. No exceptions.
 */

const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
