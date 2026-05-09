/**
 * @file auth.validation.js — Validation Chains for Auth Routes
 *
 * SCOPE: Internal to auth/ — only auth.routes.js imports this.
 *
 * VALIDATION STRATEGY:
 *   - Firebase tokens are verified by middleware, not express-validator
 *   - These chains validate the Authorization header format and
 *     optional registration metadata sent in the request body
 *   - All body fields are OPTIONAL because existing users don't send them
 *   - Required field enforcement for first-time users happens at the
 *     service layer (where we know if the user is new or existing)
 *
 * USAGE:
 *   router.post('/sync', verifyFirebaseToken, validateSync, validate, controller.sync);
 */

const { header, body } = require('express-validator');

/**
 * validateSync — Rules for POST /auth/sync
 *
 * Validates:
 *   - Authorization header (Bearer format)
 *   - Optional registration metadata (fullName, rollNumber, department, yearOfStudy)
 *
 * NOTE: All body fields are optional at the validation layer.
 * For existing users, the body is empty — metadata is ignored.
 * For first-time users, the frontend sends registration data.
 * The service layer handles the "new vs existing" distinction.
 */
const validateSync = [
  // ── Header ──
  header('authorization')
    .notEmpty()
    .withMessage('Authorization header is required')
    .custom((value) => {
      if (!value.startsWith('Bearer ')) {
        throw new Error('Authorization header must be in format: Bearer <token>');
      }
      return true;
    }),

  // ── Optional Registration Metadata ──
  // These are only used when a first-time user syncs.
  // For existing users, these are silently ignored by the service.

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
    .isLength({ min: 1, max: 100 })
    .withMessage('Department must be between 1 and 100 characters'),

  body('yearOfStudy')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Year of study must be between 1 and 4'),
];

module.exports = {
  validateSync,
};
