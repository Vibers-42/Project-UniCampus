/**
 * @file token.js — JWT Token Helpers
 *
 * SINGLE RESPONSIBILITY:
 *   Generates and verifies JSON Web Tokens. No business logic.
 *   No database calls. No knowledge of any module.
 *
 * EXPORTS:
 *   generateAccessToken(payload)  — Short-lived token (Authorization header)
 *   generateRefreshToken(payload) — Long-lived token (httpOnly cookie)
 *   verifyAccessToken(token)      — Decodes & verifies an access token
 *   verifyRefreshToken(token)     — Decodes & verifies a refresh token
 *
 * DESIGN:
 *   Two separate secrets for access and refresh tokens.
 *   - Access tokens: short TTL (15m default), sent in Authorization header.
 *   - Refresh tokens: long TTL (7d default), stored in httpOnly cookie.
 *   If the auth strategy changes, only this file and auth.middleware.js change.
 *
 * USAGE:
 *   const { generateAccessToken, verifyAccessToken } = require('../shared/utils/token');
 *   const accessToken = generateAccessToken({ id: user._id, role: user.role });
 *   const decoded = verifyAccessToken(token); // throws on invalid/expired
 */

const jwt = require('jsonwebtoken');
const env = require('../../config/env');

/**
 * Generate a short-lived access token.
 * @param {Object} payload — Data to encode (typically { id, role })
 * @returns {string} Signed JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });
};

/**
 * Generate a long-lived refresh token.
 * @param {Object} payload — Data to encode (typically { id })
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  });
};

/**
 * Verify and decode an access token.
 * @param {string} token — The JWT to verify
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError} If token is invalid
 * @throws {TokenExpiredError} If token has expired
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Verify and decode a refresh token.
 * @param {string} token — The JWT to verify
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError} If token is invalid
 * @throws {TokenExpiredError} If token has expired
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
