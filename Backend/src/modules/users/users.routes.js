/**
 * @file users.routes.js — User Profile Route Definitions
 *
 * PUBLIC INTERFACE:
 *   This is one of only two files in this module that can be imported
 *   outside the users/ folder (the other is users.service.js).
 *
 * ROUTES:
 *   GET    /users/profile          → Get own profile
 *   PATCH  /users/profile          → Update own profile
 *   PATCH  /users/avatar           → Update avatar URL
 *   POST   /users/onboarding       → Complete onboarding
 *   POST   /users/onboarding/skip  → Skip onboarding
 *   GET    /users/search           → Search users (filtered, paginated)
 *   GET    /users/:email           → View any user's public profile
 *
 * MIDDLEWARE ORDER:
 *   protect → [profileLimiter] → [validation chain] → validate → controller
 *
 * All routes require authentication (protect).
 */

const { Router } = require('express');
const controller = require('./users.controller');
const {
  validateUpdateProfile,
  validateOnboarding,
  validateAvatar,
  validateGetByEmail,
  validateSearch,
} = require('./users.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');
const { profileLimiter } = require('../../middleware/rateLimit.middleware');

const router = Router();

// All users routes require authentication
router.use(protect);

// ───── Routes ─────
// IMPORTANT: /profile, /avatar, /onboarding, and /search
// must come BEFORE /:email otherwise Express treats them as email params.

// ── Profile ──
router.get('/profile', controller.getProfile);
router.patch('/profile', profileLimiter, validateUpdateProfile, validate, controller.updateProfile);

// ── Avatar ──
router.patch('/avatar', profileLimiter, validateAvatar, validate, controller.updateAvatar);

// ── Onboarding ──
router.post('/onboarding', profileLimiter, validateOnboarding, validate, controller.completeOnboarding);
router.post('/onboarding/skip', controller.skipOnboarding);

// ── Search & Public Profiles ──
router.get('/search', validateSearch, validate, controller.searchUsers);
router.get('/:email', validateGetByEmail, validate, controller.getByEmail);

module.exports = router;
