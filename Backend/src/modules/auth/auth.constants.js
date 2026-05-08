/**
 * @file auth.constants.js — Auth Module Constants
 *
 * SINGLE RESPONSIBILITY:
 *   Constants used ONLY within the auth module. No other module imports this file.
 *
 * SCOPE:
 *   Internal to auth/ — never imported outside this folder.
 *   If the auth strategy changes (OTP → password → OAuth), these constants
 *   change here and nowhere else.
 */

const OTP_EXPIRY_MINUTES = 10;

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const COOKIE_OPTIONS = Object.freeze({
  httpOnly: true,   // JavaScript can't read it (prevents XSS token theft)
  secure: true,     // Sent only over HTTPS (override in dev if needed)
  sameSite: 'strict', // Prevents CSRF — cookie only sent from same-origin
});

const TOKEN_TYPES = Object.freeze({
  ACCESS: 'access',
  REFRESH: 'refresh',
});

module.exports = {
  OTP_EXPIRY_MINUTES,
  REFRESH_TOKEN_COOKIE_NAME,
  COOKIE_OPTIONS,
  TOKEN_TYPES,
};
