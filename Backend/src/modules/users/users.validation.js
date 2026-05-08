/**
 * @file users.validation.js — Validation Chains for Users Routes
 *
 * SCOPE: Internal to users/ — only users.routes.js imports this.
 */

const { body, param } = require('express-validator');

/**
 * validateUpdateProfile — Rules for PATCH /users/profile
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
    .trim(),

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

module.exports = {
  validateUpdateProfile,
  validateGetByEmail,
};
