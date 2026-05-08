/**
 * @file auth.middleware.js — JWT Verification & Role Authorization
 *
 * SINGLE RESPONSIBILITY:
 *   Reads the JWT from the Authorization header, verifies it, and
 *   attaches the decoded payload to req.user. Optionally restricts
 *   access based on user roles.
 *
 * EXPORTS:
 *   protect      — Requires a valid JWT. Attaches decoded payload to req.user.
 *   restrictTo   — Factory function. Takes allowed roles, returns middleware
 *                  that checks req.user.role against the list.
 *
 * LOOSE COUPLING RULE (non-negotiable):
 *   This file reads ONLY the JWT. It has ZERO knowledge of any specific
 *   module — not auth, not users, nothing. It does not import any model.
 *   It does not query the database. It trusts the data inside the token.
 *
 *   Why? Because if the auth strategy changes (e.g., swap JWT for sessions,
 *   or add OAuth), only this file and the token utility change. Every
 *   module that uses protect/restrictTo remains untouched.
 *
 * FAILURE BEHAVIOR:
 *   On failure, this middleware creates an error and passes it to next(err).
 *   It NEVER sends a response directly (res.json/res.status). All response
 *   formatting is handled by error.middleware.js.
 *
 * USAGE:
 *   router.get('/profile', protect, getProfile);
 *   router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);
 */

const { verifyAccessToken } = require('../shared/utils/token');

/**
 * protect — Verify JWT access token from Authorization header.
 *
 * Expected header: Authorization: Bearer <token>
 *
 * On success: attaches decoded token payload to req.user
 *             (typically contains { id, role, iat, exp })
 * On failure: passes error to error.middleware via next(err)
 */
const protect = (req, res, next) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Access denied. No token provided.');
    err.statusCode = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    const err = new Error('Access denied. Token is malformed.');
    err.statusCode = 401;
    return next(err);
  }

  // 2. Verify token (throws JsonWebTokenError or TokenExpiredError on failure,
  //    which error.middleware.js knows how to handle)
  const decoded = verifyAccessToken(token);

  // 3. Attach decoded payload to request
  // The payload typically contains { id, role } — set during login.
  // Controllers/services can access req.user.id, req.user.role, etc.
  req.user = decoded;

  next();
};

/**
 * restrictTo — Role-based access control factory.
 *
 * Returns a middleware that checks if req.user.role is in the allowed list.
 * Must be used AFTER protect (req.user must exist).
 *
 * @param  {...string} roles — Allowed roles (e.g., 'admin', 'clubAdmin')
 * @returns {Function} Express middleware
 *
 * USAGE:
 *   router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);
 *   router.post('/events', protect, restrictTo('admin', 'clubAdmin'), createEvent);
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // protect must run first — if req.user is missing, something is wrong
    if (!req.user) {
      const err = new Error('Authentication required. Please log in.');
      err.statusCode = 401;
      return next(err);
    }

    if (!roles.includes(req.user.role)) {
      const err = new Error(
        `Access denied. Role "${req.user.role}" is not authorized for this action.`
      );
      err.statusCode = 403;
      return next(err);
    }

    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
