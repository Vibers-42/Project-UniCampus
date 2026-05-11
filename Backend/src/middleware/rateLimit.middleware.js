/**
 * @file rateLimit.middleware.js — Request Rate Limiters
 *
 * SINGLE RESPONSIBILITY:
 *   Provides configurable rate limiters to prevent brute-force attacks
 *   and API abuse. Each limiter is a preset — routes just pick which one.
 *
 * DEVELOPMENT vs PRODUCTION:
 *   Development limits are relaxed to prevent blocking during active
 *   development (React StrictMode double-mounts, hot-reloads, rapid
 *   navigation testing). Production limits remain strict.
 *
 * EXPORTS:
 *   generalLimiter — Global API rate limit (applied in app.js)
 *   authLimiter    — Auth route rate limit (login, register)
 *   profileLimiter — Profile update rate limit
 *   resendLimiter  — Email resend rate limit (very strict)
 */

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const isDev = env.NODE_ENV === 'development';

/**
 * General rate limiter — applied globally to all API routes.
 *
 * Development: 500 requests per 15 minutes (handles StrictMode, hot-reload, polling)
 * Production:  200 requests per 15 minutes (generous but safe)
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 200,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health',
});

/**
 * Auth rate limiter — 20 req/15min (strict — brute-force protection).
 * Same in dev and prod — auth abuse is always dangerous.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 40 : 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Profile rate limiter — prevents rapid profile update abuse.
 * Development: 60 requests per 15 minutes
 * Production:  30 requests per 15 minutes
 */
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 60 : 30,
  message: {
    success: false,
    message: 'Too many profile update requests. Please try again after 15 minutes.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Resend verification rate limiter — very strict to prevent email flooding.
 * Same in dev and prod.
 */
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
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
