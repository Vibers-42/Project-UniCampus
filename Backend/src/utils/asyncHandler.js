/**
 * @file Async Handler Utility
 * @description Wraps async Express route handlers so rejected promises are
 *              automatically forwarded to the centralized error middleware.
 *
 * WHY THIS EXISTS:
 * - Without this, every async controller needs its own try/catch block.
 * - Forgetting a try/catch causes unhandled promise rejections and crashes.
 * - This wrapper eliminates that boilerplate entirely.
 *
 * USAGE:
 *   router.get('/users', asyncHandler(async (req, res) => {
 *     const users = await UserService.findAll();
 *     res.json(new ApiResponse(200, users));
 *   }));
 *
 * HOW IT WORKS:
 * - Takes an async function and returns a new function.
 * - The returned function calls the original and catches any rejection,
 *   passing the error to next() so Express's error middleware handles it.
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
