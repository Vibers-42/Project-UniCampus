/**
 * @file users.routes.js — User Profile Route Definitions
 *
 * PUBLIC INTERFACE:
 *   This is one of only two files in this module that can be imported
 *   outside the users/ folder (the other is users.service.js).
 *
 * ROUTES:
 *   GET    /users/profile     → Get own profile
 *   PATCH  /users/profile     → Update own profile (upsert)
 *   GET    /users/search      → Search users (filtered, paginated)
 *   GET    /users/:email      → View any user's public profile
 *
 * MIDDLEWARE ORDER:
 *   protect → [validation chain] → validate → controller
 *
 * All routes require authentication (protect).
 */

const { Router } = require('express');
const controller = require('./users.controller');
const { validateUpdateProfile, validateGetByEmail, validateSearch } = require('./users.validation');
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

router.get('/search', validateSearch, validate, controller.searchUsers);

router.get('/:email', validateGetByEmail, validate, controller.getByEmail);

module.exports = router;
