/**
 * @file auth.routes.js — Auth Route Definitions
 *
 * SINGLE RESPONSIBILITY:
 *   Maps HTTP methods + URLs to validation chains and controller functions.
 *   This is the ONLY file from the auth module that is imported outside
 *   (by routes/index.js).
 *
 * ROUTE MAP:
 *   POST /auth/register    → validateRegister → validate → controller.register
 *   POST /auth/verify-otp  → validateVerifyOTP → validate → controller.verifyOTP
 *   POST /auth/resend-otp  → validateResendOTP → validate → controller.resendOTP
 *   POST /auth/refresh     → controller.refresh
 *   POST /auth/logout      → protect → controller.logout
 *
 * MIDDLEWARE CHAIN ORDER:
 *   authLimiter → [validation rules] → validate → controller
 *
 * SECURITY:
 *   - authLimiter applied to ALL auth routes (10 req / 15 min per IP)
 *   - logout requires valid JWT (protect middleware)
 */

const { Router } = require('express');
const controller = require('./auth.controller');
const { validateRegister, validateVerifyOTP, validateResendOTP, validateRefresh } = require('./auth.validation');
const validate = require('../../middleware/validation.middleware');
const { authLimiter } = require('../../middleware/rateLimit.middleware');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

// Apply authLimiter to all auth routes (10 requests per 15 minutes per IP)
router.use(authLimiter);

// ───── Routes ─────

router.post('/register', validateRegister, validate, controller.register);

router.post('/verify-otp', validateVerifyOTP, validate, controller.verifyOTP);

router.post('/resend-otp', validateResendOTP, validate, controller.resendOTP);

router.post('/refresh', validateRefresh, validate, controller.refresh);

router.post('/logout', protect, controller.logout);

module.exports = router;
