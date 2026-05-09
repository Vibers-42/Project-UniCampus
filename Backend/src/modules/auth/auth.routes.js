/**
 * @file auth.routes.js — Auth Route Definitions
 *
 * SINGLE RESPONSIBILITY:
 *   Maps HTTP methods + URLs to middleware chains and controller functions.
 *   This is the ONLY file from the auth module that is imported outside
 *   (by routes/index.js).
 *
 * ROUTE MAP:
 *   POST /auth/sync  → verifyFirebaseToken → validate → controller.sync
 *   GET  /auth/me    → protect → controller.me
 *
 * WHY TWO DIFFERENT AUTH MIDDLEWARES:
 *   - /auth/sync uses verifyFirebaseToken (lightweight): Verifies the Firebase
 *     token and attaches { firebaseUid, email } to req.firebaseUser. Does NOT
 *     require the user to exist in MongoDB (they might be syncing for the
 *     first time — the sync handler creates the record).
 *
 *   - /auth/me uses protect (full): Verifies the Firebase token AND looks up
 *     the MongoDB user. This requires the user to already exist in MongoDB
 *     (which they will after sync has been called at least once).
 *
 * IDEMPOTENCY:
 *   POST /auth/sync is designed to be fully idempotent. Multiple identical
 *   requests safely return the same user without creating duplicates.
 *   This is critical because:
 *     - Frontend may retry on network failures
 *     - Multiple tabs may sync simultaneously
 *     - App reload triggers sync on every session start
 *
 * SECURITY:
 *   - authLimiter applied to ALL auth routes (20 req / 15 min per IP)
 *   - Firebase ID token required for both routes
 *   - Email verification enforced at middleware layer
 *   - @adityauniversity.in domain enforced at middleware + service layer
 */

const { Router } = require('express');
const controller = require('./auth.controller');
const { validateSync } = require('./auth.validation');
const validate = require('../../middleware/validation.middleware');
const { authLimiter, resendLimiter } = require('../../middleware/rateLimit.middleware');
const { protect } = require('../../middleware/auth.middleware');
const { verifyToken } = require('../../config/firebase');
const AppError = require('../../shared/utils/AppError');

const router = Router();

// Apply authLimiter to all auth routes (20 requests per 15 minutes per IP)
router.use(authLimiter);

/**
 * The ONLY allowed email domain for UniCampus.
 */
const ALLOWED_DOMAIN = 'adityauniversity.in';

// ──────────────────────────────────────────
// Lightweight Firebase Token Middleware (for /sync only)
// ──────────────────────────────────────────

/**
 * Verifies Firebase ID token WITHOUT requiring MongoDB user to exist.
 * Used only for the /sync route where first-time users don't have
 * a MongoDB record yet.
 *
 * Enforces:
 *   - Valid Firebase token
 *   - Email present in token
 *   - Email verified by Firebase
 *   - Email belongs to @adityauniversity.in
 *
 * Sets req.firebaseUser = { firebaseUid, email }
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Access denied. Token is malformed.', 401));
    }

    const decoded = await verifyToken(token);

    if (!decoded.email) {
      return next(new AppError('Firebase token does not contain an email.', 400));
    }

    if (!decoded.email_verified) {
      return next(new AppError('Please verify your email before accessing UniCampus.', 403));
    }

    // Enforce institutional domain (case-insensitive)
    const email = decoded.email.toLowerCase();
    const domain = email.split('@')[1];

    if (domain !== ALLOWED_DOMAIN) {
      return next(
        new AppError(
          `Only @${ALLOWED_DOMAIN} email addresses are allowed on UniCampus.`,
          403
        )
      );
    }

    req.firebaseUser = {
      firebaseUid: decoded.uid,
      email,
    };

    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    }
    if (error.code === 'auth/id-token-revoked') {
      return next(new AppError('Token has been revoked. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
};

// ───── Routes ─────

/**
 * POST /auth/sync
 *
 * Called by frontend after successful Firebase authentication.
 * Idempotent: safe to call multiple times.
 *
 * First-time users: creates MongoDB record with optional metadata from body.
 * Existing users: returns existing profile (body metadata ignored).
 *
 * Returns 201 for new users, 200 for existing users.
 */
router.post('/sync', verifyFirebaseToken, validateSync, validate, controller.sync);

/**
 * POST /auth/resend-verification
 *
 * Resends the verification email using Firebase Admin SDK.
 * No auth token required (user is signed out after registration).
 * Rate limited to 3 requests per 15 minutes per IP.
 *
 * Body: { email }
 */
router.post('/resend-verification', resendLimiter, controller.resendVerification);

/**
 * GET /auth/me
 *
 * Returns the current authenticated user's full profile.
 * Requires user to already exist in MongoDB (call /auth/sync first).
 */
router.get('/me', protect, controller.me);

module.exports = router;
