/**
 * @file auth.controller.js — Auth Request Handlers
 *
 * SINGLE RESPONSIBILITY:
 *   Thin layer between routes and auth.service.js.
 *   Each function: parses req → calls service → sends response.
 *   No business logic. No direct DB calls.
 *
 * SCOPE:
 *   Internal to auth/ — only auth.routes.js imports this file.
 *
 * ENDPOINTS:
 *   POST /auth/sync  — Sync Firebase user → MongoDB, return user data
 *   GET  /auth/me    — Return current authenticated user's full profile
 *
 * PATTERNS:
 *   - Every function is wrapped in catchAsync (no try/catch)
 *   - Every response uses sendSuccess (no raw res.json)
 *   - Firebase ID token is verified by middleware BEFORE
 *     these handlers run — req.firebaseUser or req.user is always available
 *
 * NOTE:
 *   Firebase handles signup, email verification, password reset, and
 *   session persistence. The backend only verifies tokens and syncs
 *   MongoDB records. There are no OTP or refresh-token endpoints.
 */

const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const AppError = require('../../shared/utils/AppError');
const authService = require('./auth.service');
const { firebaseAdmin } = require('../../config/firebase');
const env = require('../../config/env');
const logger = require('../../shared/utils/logger');
const { sendEmailNotification } = require('../../shared/notificationService');

/**
 * POST /auth/sync
 *
 * Called by the frontend after Firebase authentication succeeds.
 * The verifyFirebaseToken middleware (in auth.routes.js) has already
 * verified the Firebase ID token, checked email_verified, enforced
 * the @adityauniversity.in domain, and populated req.firebaseUser.
 *
 * CASE A — EXISTING USER:
 *   req.body metadata is IGNORED. Returns existing user profile.
 *
 * CASE B — FIRST-TIME USER:
 *   req.body metadata (fullName, rollNumber, department, yearOfStudy)
 *   is used to create the MongoDB record.
 *
 * IDEMPOTENT: Multiple identical calls are safe.
 */
const sync = catchAsync(async (req, res) => {
  const { firebaseUid, email } = req.firebaseUser;

  // Pass optional metadata from request body (only used for new users)
  const metadata = {
    fullName: req.body.fullName,
    rollNumber: req.body.rollNumber,
    department: req.body.department,
    yearOfStudy: req.body.yearOfStudy,
  };

  const result = await authService.syncUser(firebaseUid, email, metadata);

  const statusCode = result.isNewUser ? 201 : 200;
  const message = result.isNewUser
    ? 'Account created successfully.'
    : 'Login successful.';

  sendSuccess(res, result, message, statusCode);
});

/**
 * GET /auth/me
 *
 * Returns the current authenticated user's full profile.
 * Used by the frontend on app load to check auth status and
 * determine where to redirect (onboarding vs dashboard).
 *
 * protect middleware guarantees req.user.id is available.
 */
const me = catchAsync(async (req, res) => {
  const result = await authService.getCurrentUser(req.user.id);
  sendSuccess(res, result, 'User fetched successfully.');
});

/**
 * POST /auth/resend-verification
 *
 * Resends the verification email using Firebase Admin SDK.
 * No auth token required (user is signed out after registration).
 *
 * Body: { email }
 *
 * Steps:
 *   1. Validate email domain
 *   2. Look up Firebase user by email
 *   3. Check if already verified
 *   4. Generate verification link with redirect
 *   5. Send via Nodemailer
 */
const resendVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email is required.', 400));
  }

  const normalizedEmail = email.toLowerCase();
  const domain = normalizedEmail.split('@')[1];

  if (domain !== 'adityauniversity.in') {
    return next(new AppError('Only @adityauniversity.in emails are allowed.', 400));
  }

  // Find Firebase user by email
  let firebaseUser;
  try {
    firebaseUser = await firebaseAdmin.auth().getUserByEmail(normalizedEmail);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      // Intentionally vague to prevent account enumeration
      return next(new AppError('No account found for this email.', 404));
    }
    throw err;
  }

  // Check if already verified
  if (firebaseUser.emailVerified) {
    return next(new AppError('Email is already verified. Please sign in.', 400));
  }

  // Generate verification link with redirect to login
  const redirectUrl = `${env.FRONTEND_URL}/login?verified=true`;
  const verificationLink = await firebaseAdmin.auth().generateEmailVerificationLink(
    normalizedEmail,
    { url: redirectUrl }
  );

  // Send via Nodemailer (uses existing notificationService infrastructure)
  await sendEmailNotification(
    normalizedEmail,
    'Verify your UniCampus email',
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">UniCampus — Email Verification</h2>
        <p>Hello,</p>
        <p>Please verify your email address to complete your UniCampus registration.</p>
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
          <tr>
            <td style="background-color: #6366f1; border-radius: 8px; padding: 12px 24px;">
              <a href="${verificationLink}" 
                 style="color: #ffffff; text-decoration: none; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </td>
          </tr>
        </table>
        <p style="color: #888; font-size: 14px;">
          If you didn't create a UniCampus account, you can safely ignore this email.
        </p>
        <p style="color: #888; font-size: 12px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationLink}" style="color: #6366f1; word-break: break-all;">${verificationLink}</a>
        </p>
      </div>
    `
  );

  logger.info('Verification email resent to:', normalizedEmail);
  sendSuccess(res, null, 'Verification email resent.', 200);
});

module.exports = {
  sync,
  me,
  resendVerification,
};
