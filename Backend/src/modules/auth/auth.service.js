/**
 * @file auth.service.js — Auth Business Logic
 *
 * SINGLE RESPONSIBILITY:
 *   ALL authentication business logic lives here. Registration, OTP verification,
 *   token generation, token refresh, and logout. No req/res objects — pure logic.
 *
 * PUBLIC INTERFACE:
 *   register(email, role)         → { message }
 *   verifyOTP(email, otp)         → { accessToken, refreshToken, user }
 *   resendOTP(email)              → { message }
 *   refreshTokens(refreshToken)   → { accessToken, refreshToken }
 *   logout(userId)                → { message }
 *
 * DEPENDENCY RULES:
 *   This service imports ONLY:
 *     - auth.model.js      (internal to auth/)
 *     - auth.constants.js   (internal to auth/)
 *     - shared/utils/token.js
 *     - shared/utils/otp.js
 *     - shared/utils/AppError.js
 *     - shared/utils/logger.js
 *     - shared/notificationService.js
 *   It NEVER imports from any other module.
 *
 * STRATEGY ISOLATION:
 *   Currently OTP-based. To switch to password-based:
 *   1. Add password field to auth.model.js
 *   2. Rewrite register/login logic in THIS file
 *   3. Nothing outside auth/ changes
 *
 * REFRESH TOKEN STORAGE:
 *   Refresh tokens are hashed with SHA-256 before saving to DB.
 *   Why SHA-256 and not bcrypt? JWTs are >200 chars; bcrypt silently
 *   truncates at 72 bytes. SHA-256 has no length limit.
 */

const crypto = require('crypto');
const AuthModel = require('./auth.model');
const { OTP_EXPIRY_MINUTES } = require('./auth.constants');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../shared/utils/token');
const { generateOTP, hashOTP, verifyOTP: verifyOTPHash } = require('../../shared/utils/otp');
const AppError = require('../../shared/utils/AppError');
const logger = require('../../shared/utils/logger');
const { sendEmailNotification } = require('../../shared/notificationService');

// ──────────────────────────────────────────
// INTERNAL HELPERS (not exported)
// ──────────────────────────────────────────

/**
 * Hash a refresh token with SHA-256 for safe DB storage.
 * @param {string} token — Raw refresh token JWT
 * @returns {string} Hex-encoded SHA-256 hash
 */
const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate both access and refresh tokens for a user.
 * @param {Object} user — User document (needs _id, email, and role)
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokenPair = (user) => {
  const accessToken = generateAccessToken({ id: user._id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });
  return { accessToken, refreshToken };
};

/**
 * Build the OTP email HTML body.
 * @param {string} otp — The plain-text OTP
 * @returns {string} HTML email body
 */
const buildOTPEmail = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4F46E5;">UniCampus Verification</h2>
      <p>Your one-time verification code is:</p>
      <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F2937;">${otp}</span>
      </div>
      <p style="color: #6B7280; font-size: 14px;">
        This code expires in ${OTP_EXPIRY_MINUTES} minutes.<br/>
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `;
};

/**
 * Generate a new OTP, hash it, and send it via email.
 * Reused by both register() and resendOTP() to avoid duplication.
 *
 * @param {Object} user — Mongoose user document to update
 * @param {string} emailSubject — Email subject line
 * @returns {Promise<void>}
 */
const generateAndSendOTP = async (user, emailSubject) => {
  const otp = generateOTP();
  const otpHash = await hashOTP(otp);

  user.otp = otpHash;
  user.otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await user.save();

  await sendEmailNotification(user.email, emailSubject, buildOTPEmail(otp));
  logger.debug(`OTP sent to ${user.email}`);
};

// ──────────────────────────────────────────
// PUBLIC INTERFACE
// ──────────────────────────────────────────

/**
 * Register a new user account.
 *
 * Flow:
 *   1. Check if email already exists → throw if it does
 *   2. Create user record
 *   3. Generate OTP, hash it, save to user, send via email
 *
 * @param {string} email — User's institutional email
 * @param {string} [role='student'] — User role
 * @returns {Promise<{ message: string }>}
 */
const register = async (email, role = 'student') => {
  // 1. Check if email already exists
  const existingUser = await AuthModel.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // 2. Create user record
  const user = await AuthModel.create({ email, role });

  // 3. Generate OTP, save hash, and send email
  await generateAndSendOTP(user, 'UniCampus — Verify Your Account');

  return { message: 'OTP sent to your email. Please verify to complete registration.' };
};

/**
 * Verify OTP and issue authentication tokens.
 *
 * Flow:
 *   1. Find user by email, select +otp +otpExpiry
 *   2. Verify OTP hash matches and hasn't expired
 *   3. Mark user as verified, clear OTP fields
 *   4. Generate access + refresh tokens
 *   5. Save hashed refresh token to DB, update lastLogin
 *
 * @param {string} email — User's email
 * @param {string} otp — 6-digit OTP submitted by user
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: Object }>}
 */
const verifyOTPService = async (email, otp) => {
  // 1. Find user with OTP fields included
  const user = await AuthModel.findOne({ email }).select('+otp +otpExpiry');

  if (!user) {
    throw new AppError('No account found with this email.', 404);
  }

  // 2. Check OTP exists
  if (!user.otp) {
    throw new AppError('No OTP was requested. Please register or resend OTP.', 400);
  }

  // 3. Verify OTP hash
  const isOTPValid = await verifyOTPHash(otp, user.otp);
  if (!isOTPValid) {
    throw new AppError('Invalid OTP. Please check and try again.', 400);
  }

  // 4. Check expiry
  if (user.otpExpiry < new Date()) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  // 5. Mark verified, clear OTP fields
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.lastLogin = new Date();

  // 6. Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(user);

  // 7. Save hashed refresh token
  user.refreshToken = hashRefreshToken(refreshToken);
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Resend OTP to an existing user.
 *
 * Flow:
 *   1. Find user by email
 *   2. Generate new OTP, hash it, save to user, send via email
 *
 * USE CASE: Returning users who want to log in, or users whose OTP expired.
 *
 * @param {string} email — User's email
 * @returns {Promise<{ message: string }>}
 */
const resendOTP = async (email) => {
  const user = await AuthModel.findOne({ email });

  if (!user) {
    throw new AppError('No account found with this email. Please register first.', 404);
  }

  await generateAndSendOTP(user, 'UniCampus — Your New Verification Code');

  return { message: 'New OTP sent to your email.' };
};

/**
 * Refresh authentication tokens.
 *
 * Flow:
 *   1. Verify the refresh token JWT (throws if invalid/expired)
 *   2. Find user by decoded ID, select +refreshToken
 *   3. Compare incoming token hash with stored hash
 *   4. Generate new token pair
 *   5. Rotate: save new hashed refresh token, invalidating the old one
 *
 * ROTATION: Every refresh invalidates the old token. If an old token is
 * reused (theft detected), the stored hash won't match → access denied.
 *
 * @param {string} incomingRefreshToken — The refresh token JWT from cookie
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
const refreshTokens = async (incomingRefreshToken) => {
  // 1. Verify JWT structure and signature
  const decoded = verifyRefreshToken(incomingRefreshToken);

  // 2. Find user with stored refresh token hash
  const user = await AuthModel.findById(decoded.id).select('+refreshToken');

  if (!user) {
    throw new AppError('User not found. Please log in again.', 401);
  }

  if (!user.refreshToken) {
    throw new AppError('Session expired. Please log in again.', 401);
  }

  // 3. Compare incoming token hash with stored hash
  const incomingHash = hashRefreshToken(incomingRefreshToken);
  if (incomingHash !== user.refreshToken) {
    // Possible token theft — clear all sessions for this user
    user.refreshToken = undefined;
    await user.save();

    logger.warn(`Refresh token reuse detected for user ${user._id}`);
    throw new AppError('Token reuse detected. Please log in again.', 401);
  }

  // 4. Generate new token pair
  const { accessToken, refreshToken } = generateTokenPair(user);

  // 5. Rotate: save new hash
  user.refreshToken = hashRefreshToken(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
};

/**
 * Log out a user by clearing their refresh token.
 *
 * @param {string} userId — The user's MongoDB _id
 * @returns {Promise<{ message: string }>}
 */
const logout = async (userId) => {
  await AuthModel.findByIdAndUpdate(userId, { refreshToken: undefined });
  return { message: 'Logged out successfully.' };
};

module.exports = {
  register,
  verifyOTP: verifyOTPService,
  resendOTP,
  refreshTokens,
  logout,
};
