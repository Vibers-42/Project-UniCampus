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
 * req.user CONTRACT:
 *   After protect runs successfully, req.user is guaranteed to contain
 *   the decoded JWT payload. At minimum:
 *     req.user.id    — MongoDB _id of the authenticated user
 *     req.user.email — User's email address
 *     req.user.role  — 'student' | 'clubAdmin' | 'admin'
 *     req.user.iat   — Token issued-at timestamp
 *     req.user.exp   — Token expiry timestamp
 *
 * USAGE:
 *   router.get('/profile', protect, getProfile);
 *   router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);
 */

const { verifyAccessToken } = require('../shared/utils/token');
const AppError = require('../shared/utils/AppError');

/**
 * protect — Verify JWT access token from Authorization header.
 *
 * Expected header: Authorization: Bearer <token>
 *
 * On success: attaches decoded token payload to req.user
 *             (typically contains { id, email, role, iat, exp })
 * On failure: passes error to error.middleware via next(err)
 */
const protect = (req, res, next) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Access denied. Token is malformed.', 401));
  }

  // 2. Verify token
  //    Wrapped in try/catch to handle JWT verification failures explicitly.
  //    Without this, JsonWebTokenError/TokenExpiredError would propagate
  //    as uncaught exceptions — they'd still reach error.middleware.js,
  //    but the error path would be unintentional rather than deliberate.
  try {
    const decoded = verifyAccessToken(token);

    // 3. Attach decoded payload to request
    // Controllers/services can access req.user.id, req.user.email, req.user.role
    req.user = decoded;

    next();
  } catch (err) {
    // Let error.middleware.js handle JWT-specific error formatting
    // (JsonWebTokenError → 401, TokenExpiredError → 401)
    return next(err);
  }
};

/**
 * restrictTo — Role-based access control factory.
 *
 * Returns a middleware that checks if req.user.role is in the allowed list.
 * Must be used AFTER protect (req.user must exist).
 *
 * Supports any number of roles — future roles (e.g., 'moderator', 'faculty')
 * can be added without modifying this middleware.
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
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role "${req.user.role}" is not authorized for this action.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
