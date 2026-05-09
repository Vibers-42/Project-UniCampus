/**
 * @file auth.middleware.js — Firebase Token Verification & Role Authorization
 *
 * SINGLE RESPONSIBILITY:
 *   Reads the Firebase ID token from the Authorization header, verifies it
 *   via Firebase Admin SDK, enforces platform rules (email verification,
 *   domain restriction), looks up the corresponding MongoDB user, and
 *   attaches the user data to req.user. Optionally restricts access
 *   based on user roles.
 *
 * EXPORTS:
 *   protect      — Requires a valid Firebase ID token. Attaches user to req.user.
 *   restrictTo   — Factory function. Takes allowed roles, returns middleware
 *                  that checks req.user.role against the list.
 *
 * LOOSE COUPLING RULE (non-negotiable):
 *   This middleware imports ONLY:
 *     - config/firebase.js (verifyToken)
 *     - users.service.js (findByFirebaseUid)
 *     - shared/utils/AppError.js
 *   It has ZERO knowledge of any specific business module.
 *
 * req.user CONTRACT (critical — all modules depend on this):
 *   After protect runs successfully, req.user is guaranteed to contain:
 *     req.user.id          — MongoDB _id (used for internal relationships)
 *     req.user.email       — User's email (used for cross-module identity)
 *     req.user.role        — 'student' | 'clubAdmin' | 'admin'
 *     req.user.firebaseUid — Firebase UID (auth mapping only)
 *
 * USAGE:
 *   router.get('/profile', protect, getProfile);
 *   router.delete('/users/:id', protect, restrictTo('admin'), deleteUser);
 */

const { verifyToken } = require('../config/firebase');
const usersService = require('../modules/users/users.service');
const AppError = require('../shared/utils/AppError');

/**
 * The ONLY allowed email domain for UniCampus.
 * Enforced at the middleware level — requests from non-institutional
 * emails are rejected even if Firebase considers them valid.
 */
const ALLOWED_DOMAIN = 'adityauniversity.in';

/**
 * protect — Verify Firebase ID token and attach MongoDB user to req.user.
 *
 * Expected header: Authorization: Bearer <Firebase ID Token>
 *
 * Flow:
 *   1. Extract token from Authorization header
 *   2. Verify token via Firebase Admin SDK → get decoded payload
 *   3. Ensure email is verified by Firebase
 *   4. Ensure email belongs to @adityauniversity.in
 *   5. Look up MongoDB user by firebaseUid
 *   6. Attach user data to req.user (preserving existing contract)
 *
 * On failure: passes AppError to error.middleware via next(err)
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new AppError('Access denied. Token is malformed.', 401));
    }

    // 2. Verify Firebase ID token
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (firebaseError) {
      // Firebase throws specific error codes — map to user-friendly messages
      if (firebaseError.code === 'auth/id-token-expired') {
        return next(new AppError('Token has expired. Please log in again.', 401));
      }
      if (firebaseError.code === 'auth/id-token-revoked') {
        return next(new AppError('Token has been revoked. Please log in again.', 401));
      }
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    // 3. Ensure email is verified
    // Firebase tracks email verification status. Unverified users should
    // not be able to access protected resources.
    if (!decoded.email_verified) {
      return next(
        new AppError('Please verify your email before accessing UniCampus.', 403)
      );
    }

    // 4. Enforce institutional domain
    // Only @adityauniversity.in emails are allowed. Case-insensitive check.
    const email = (decoded.email || '').toLowerCase();
    const domain = email.split('@')[1];

    if (domain !== ALLOWED_DOMAIN) {
      return next(
        new AppError(
          `Only @${ALLOWED_DOMAIN} email addresses are allowed on UniCampus.`,
          403
        )
      );
    }

    // 5. Look up MongoDB user by Firebase UID
    const user = await usersService.findByFirebaseUid(decoded.uid);

    if (!user) {
      return next(
        new AppError(
          'User account not found. Please log in via /auth/login to create your account.',
          401
        )
      );
    }

    // 6. Attach user data to request — preserves the existing contract
    // Every downstream controller/service accesses these fields.
    // firebaseUid is included for auth-layer use but business modules
    // should use id (MongoDB _id) and email for identity.
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      firebaseUid: user.firebaseUid,
    };

    next();
  } catch (error) {
    return next(error);
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
