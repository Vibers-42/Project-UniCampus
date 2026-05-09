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
 *   authLimiter    — 20 requests per 15-minute window per IP.
 *                    Applied to auth routes (login, register).
 *                    Prevents brute-force credential attacks.
 *   profileLimiter — 30 requests per 15-minute window per IP.
 *                    Applied to profile update routes.
 *                    Prevents rapid profile update abuse.
 *
 * USAGE:
 *   // In app.js (global):
 *   const { generalLimiter } = require('./middleware/rateLimit.middleware');
 *   app.use('/api/', generalLimiter);
 *
 *   // In auth routes (per-route):
 *   const { authLimiter } = require('../middleware/rateLimit.middleware');
 *   router.use(authLimiter);
 *
 *   // In users routes (per-route):
 *   const { profileLimiter } = require('../middleware/rateLimit.middleware');
 *   router.patch('/profile', profileLimiter, validate, controller.updateProfile);
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
 * Auth rate limiter — 20 requests per 15 minutes per IP.
 * Stricter limit for authentication endpoints to prevent brute-force.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Profile rate limiter — 30 requests per 15 minutes per IP.
 * Prevents rapid profile update abuse (e.g., avatar spam, bio flooding).
 */
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: {
    success: false,
    message: 'Too many profile update requests. Please try again after 15 minutes.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Resend verification rate limiter — 3 requests per 15 minutes per IP.
 * Very strict to prevent email flooding abuse.
 */
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: {
    success: false,
    message: 'Too many resend requests. Please try again after 15 minutes.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  profileLimiter,
  resendLimiter,
};
