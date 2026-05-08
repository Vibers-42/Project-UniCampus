/**
 * @file users.validation.js — Validation Chains for Users Routes
 *
 * SCOPE: Internal to users/ — only users.routes.js imports this.
 *
 * USAGE:
 *   router.patch('/profile', validateUpdateProfile, validate, ctrl.updateProfile);
 *   router.get('/:email', validateGetByEmail, validate, ctrl.getByEmail);
 */

const { body, param, query } = require('express-validator');

/**
 * validateUpdateProfile — Rules for PATCH /users/profile
 *
 * All fields optional (partial updates). Whitelist enforced at service layer.
 */
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be under 100 characters'),

  body('academicYear')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Academic year must be between 1 and 4'),

  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),

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

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be under 500 characters'),

  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),

  body('githubUrl')
    .optional()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),

  body('linkedinUrl')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),

  body('portfolioUrl')
    .optional()
    .isURL()
    .withMessage('Portfolio URL must be a valid URL'),

  body('college')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('College name must be under 200 characters'),
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

  query('academicYear')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Academic year must be between 1 and 4'),
];

module.exports = {
  validateUpdateProfile,
  validateGetByEmail,
  validateSearch,
};
