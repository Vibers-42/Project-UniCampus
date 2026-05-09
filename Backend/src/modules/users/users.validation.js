/**
 * @file users.validation.js — Validation Chains for Users Routes
 *
 * SCOPE: Internal to users/ — only users.routes.js imports this.
 *
 * USAGE:
 *   router.patch('/profile', validateUpdateProfile, validate, ctrl.updateProfile);
 *   router.post('/onboarding', validateOnboarding, validate, ctrl.completeOnboarding);
 *   router.get('/:email', validateGetByEmail, validate, ctrl.getByEmail);
 */

const { body, param, query } = require('express-validator');

/**
 * validateUpdateProfile — Rules for PATCH /users/profile
 *
 * All fields optional (partial updates). Whitelist enforced at service layer.
 * Immutable fields (firebaseUid, email, role, rollNumber, isVerified)
 * are not validated here because they're silently ignored by the service.
 */
const validateUpdateProfile = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be under 100 characters'),

  body('yearOfStudy')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Year of study must be between 1 and 4'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be under 500 characters'),

  body('skills')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Skills must be an array with max 20 items'),

  body('skills.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be a non-empty string under 50 characters'),

  body('interests')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Interests must be an array with max 20 items'),

  body('interests.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be a non-empty string under 50 characters'),

  body('techStack')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tech stack must be an array with max 20 items'),

  body('techStack.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tech stack item must be a non-empty string under 50 characters'),

  body('rolesPreferred')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Roles preferred must be an array with max 10 items'),

  body('rolesPreferred.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each preferred role must be a non-empty string under 50 characters'),

  body('availability')
    .optional()
    .isIn(['available', 'busy', 'looking-for-team', 'not-available', ''])
    .withMessage('Availability must be: available, busy, looking-for-team, or not-available'),

  body('github')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),

  body('linkedin')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),

  body('portfolio')
    .optional()
    .isURL()
    .withMessage('Portfolio URL must be a valid URL'),
];

/**
 * validateOnboarding — Rules for POST /users/onboarding
 *
 * All fields optional (users can skip or partially complete).
 * rollNumber is special — validated for format but immutability
 * is enforced at the service layer.
 */
const validateOnboarding = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters'),

  body('rollNumber')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Roll number must be between 2 and 20 characters')
    .isAlphanumeric()
    .withMessage('Roll number must be alphanumeric'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be under 100 characters'),

  body('yearOfStudy')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Year of study must be between 1 and 4'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be under 500 characters'),

  body('skills')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Skills must be an array with max 20 items'),

  body('skills.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be a non-empty string under 50 characters'),

  body('interests')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Interests must be an array with max 20 items'),

  body('interests.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be a non-empty string under 50 characters'),

  body('techStack')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Tech stack must be an array with max 20 items'),

  body('techStack.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tech stack item must be under 50 characters'),

  body('rolesPreferred')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Roles preferred must be an array with max 10 items'),

  body('rolesPreferred.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each preferred role must be under 50 characters'),

  body('availability')
    .optional()
    .isIn(['available', 'busy', 'looking-for-team', 'not-available', ''])
    .withMessage('Availability must be: available, busy, looking-for-team, or not-available'),

  body('github')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),

  body('linkedin')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),

  body('portfolio')
    .optional()
    .isURL()
    .withMessage('Portfolio URL must be a valid URL'),
];

/**
 * validateAvatar — Rules for PATCH /users/avatar
 */
const validateAvatar = [
  body('avatar')
    .notEmpty()
    .withMessage('Avatar URL is required')
    .isURL()
    .withMessage('Avatar must be a valid URL'),
];

/**
 * validateGetByEmail — Rules for GET /users/:email
 */
const validateGetByEmail = [
  param('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
];

/**
 * validateSearch — Rules for GET /users/search query params
 */
const validateSearch = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('yearOfStudy')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Year of study must be between 1 and 4'),

  query('availability')
    .optional()
    .isIn(['available', 'busy', 'looking-for-team', 'not-available'])
    .withMessage('Invalid availability filter'),
];

module.exports = {
  validateUpdateProfile,
  validateOnboarding,
  validateAvatar,
  validateGetByEmail,
  validateSearch,
};
