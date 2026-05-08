/**
 * @file auth.controller.js — Auth Request Handlers
 *
 * SINGLE RESPONSIBILITY:
 *   Thin layer between routes and auth.service.js.
 *   Each function: parses req → calls service → sends response.
 *   No business logic. No if/else decisions. No direct DB calls.
 *
 * SCOPE:
 *   Internal to auth/ — only auth.routes.js imports this file.
 *
 * PATTERNS:
 *   - Every function is wrapped in catchAsync (no try/catch)
 *   - Every response uses sendSuccess (no raw res.json)
 *   - Refresh token is set/cleared as httpOnly cookie by this controller
 *   - Access token is returned in the response body (frontend stores it in memory)
 */

const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const authService = require('./auth.service');
const { REFRESH_TOKEN_COOKIE_NAME, COOKIE_OPTIONS } = require('./auth.constants');
const env = require('../../config/env');

/**
 * Build cookie options, adjusting `secure` for development.
 * In dev (HTTP), secure: true would prevent the cookie from being sent.
 */
const getCookieOptions = () => ({
  ...COOKIE_OPTIONS,
  secure: env.NODE_ENV === 'production', // Override: false in dev, true in prod
});

/**
 * POST /auth/register
 * Register a new user account and send OTP via email.
 */
const register = catchAsync(async (req, res) => {
  const { email, role } = req.body;
  const result = await authService.register(email, role);
  sendSuccess(res, result, result.message, 201);
});

/**
 * POST /auth/verify-otp
 * Verify OTP, mark user as verified, and issue tokens.
 * Sets refresh token as httpOnly cookie.
 */
const verifyOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const result = await authService.verifyOTP(email, otp);

  // Set refresh token as httpOnly cookie
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getCookieOptions());

  // Return access token + user in body (frontend stores access token in memory)
  sendSuccess(res, {
    accessToken: result.accessToken,
    user: result.user,
  }, 'OTP verified successfully. You are now logged in.');
});

/**
 * POST /auth/resend-otp
 * Resend a new OTP to the user's email.
 */
const resendOTP = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendOTP(email);
  sendSuccess(res, result, result.message);
});

/**
 * POST /auth/refresh
 * Issue a new access token using the refresh token from the cookie.
 * Rotates the refresh token (old one becomes invalid).
 */
const refresh = catchAsync(async (req, res) => {
  const incomingRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

  if (!incomingRefreshToken) {
    const err = new Error('No refresh token provided. Please log in again.');
    err.statusCode = 401;
    throw err;
  }

  const result = await authService.refreshTokens(incomingRefreshToken);

  // Set new rotated refresh token as httpOnly cookie
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, getCookieOptions());

  // Return only the new access token in the body
  sendSuccess(res, { accessToken: result.accessToken }, 'Tokens refreshed successfully.');
});

/**
 * POST /auth/logout
 * Clear the refresh token from DB and remove the cookie.
 * Requires authentication (protect middleware runs first).
 */
const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user.id);

  // Clear the refresh token cookie
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getCookieOptions());

  sendSuccess(res, null, 'Logged out successfully.');
});

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  refresh,
  logout,
};
