/**
 * @file users.routes.js — User Profile Route Definitions
 *
 * This is the ONLY file from users/ imported outside (by routes/index.js).
 *
 * ROUTES:
 *   GET    /users/profile     → own profile
 *   PATCH  /users/profile     → update own profile
 *   GET    /users/search      → search users by filters
 *   GET    /users/:email      → view any user's public profile
 *
 * All routes require authentication (protect).
 */

const { Router } = require('express');
const controller = require('./users.controller');
const { validateUpdateProfile, validateGetByEmail } = require('./users.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

// All users routes require authentication
router.use(protect);

// ───── Routes ─────
// IMPORTANT: /profile and /search must come BEFORE /:email
// otherwise Express treats "profile" and "search" as email params.

router.get('/profile', controller.getProfile);

router.patch('/profile', validateUpdateProfile, validate, controller.updateProfile);

router.get('/search', controller.searchUsers);

router.get('/:email', validateGetByEmail, validate, controller.getByEmail);

module.exports = router;
