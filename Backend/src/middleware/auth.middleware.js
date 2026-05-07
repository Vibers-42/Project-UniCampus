/**
 * @file Authentication & Authorization Middleware
 * @description Placeholder middleware for JWT verification and role-based
 *              access control. Will be fully implemented when the auth
 *              module is built.
 *
 * WHY THIS EXISTS:
 * - Establishes the middleware pattern early so routes can declare
 *   `verifyJWT` and `authorizeRoles(...)` from day one.
 * - When JWT logic is implemented, only this file changes — all route
 *   files that reference it remain untouched.
 *
 * FUTURE IMPLEMENTATION:
 * 1. verifyJWT will:
 *    - Extract the token from the Authorization header (Bearer <token>)
 *    - Verify the token using JWT_SECRET from config
 *    - Attach the decoded user to req.user
 *    - Call next() on success, throw ApiError(401) on failure
 *
 * 2. authorizeRoles will:
 *    - Accept a list of allowed roles
 *    - Check if req.user.role is in the allowed list
 *    - Call next() if authorized, throw ApiError(403) if not
 */

const ApiError = require('../utils/ApiError');
const { HttpStatus } = require('../constants');

/**
 * Verify JWT token from Authorization header.
 * TODO: Implement when auth module is built.
 *
 * Usage in routes:
 *   router.get('/profile', verifyJWT, getProfile);
 */
const verifyJWT = (req, res, next) => {
  // TODO: Replace with actual JWT verification
  //
  // Implementation steps:
  // 1. const token = req.headers.authorization?.split(' ')[1];
  // 2. if (!token) throw new ApiError(401, 'Access token is missing');
  // 3. const decoded = jwt.verify(token, config.JWT_SECRET);
  // 4. const user = await User.findById(decoded.id).select('-password');
  // 5. if (!user) throw new ApiError(401, 'Invalid token');
  // 6. req.user = user;
  // 7. next();

  next(
    new ApiError(
      HttpStatus.INTERNAL_SERVER,
      'Auth middleware not implemented yet'
    )
  );
};

/**
 * Authorize based on user roles.
 * TODO: Implement when auth module is built.
 *
 * Usage in routes:
 *   router.delete('/users/:id', verifyJWT, authorizeRoles('admin'), deleteUser);
 *
 * @param  {...string} allowedRoles - Roles that can access the route
 * @returns {Function} Express middleware
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // TODO: Replace with actual role check
    //
    // Implementation steps:
    // 1. if (!req.user) throw new ApiError(401, 'Authentication required');
    // 2. if (!allowedRoles.includes(req.user.role)) {
    //      throw new ApiError(403, 'Insufficient permissions');
    //    }
    // 3. next();

    next(
      new ApiError(
        HttpStatus.INTERNAL_SERVER,
        'Role authorization not implemented yet'
      )
    );
  };
};

module.exports = {
  verifyJWT,
  authorizeRoles,
};
