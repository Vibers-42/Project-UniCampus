/**
 * @file rateLimit.middleware.js — Request Rate Limiters
 *
 * SINGLE RESPONSIBILITY:
 *   Provides configurable rate limiters to prevent brute-force attacks
 *   and API abuse. Each limiter is a preset — routes just pick which one.
 *
 * EXPORTS:
 *   generalLimiter — 100 requests per 15-minute window per IP.
 *                    Applied globally to all /api/ routes in app.js.
 *   authLimiter    — 10 requests per 15-minute window per IP.
 *                    Applied only to auth routes (login, register, OTP).
 *                    Prevents brute-force credential attacks.
 *
 * USAGE:
 *   // In app.js (global):
 *   const { generalLimiter } = require('./middleware/rateLimit.middleware');
 *   app.use('/api/', generalLimiter);
 *
 *   // In auth routes (per-route):
 *   const { authLimiter } = require('../middleware/rateLimit.middleware');
 *   router.post('/login', authLimiter, validate, authController.login);
 */

const rateLimit = require('express-rate-limit');

/**
 * General rate limiter — 100 requests per 15 minutes per IP.
 * Fair-use limit for all API endpoints.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    statusCode: 429,
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable deprecated `X-RateLimit-*` headers
});

/**
 * Auth rate limiter — 10 requests per 15 minutes per IP.
 * Strict limit for authentication endpoints to prevent brute-force.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
};
