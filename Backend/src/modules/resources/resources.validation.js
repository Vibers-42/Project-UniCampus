/**
 * @file resources.validation.js — Express-Validator Chains for Resource Routes
 *
 * SCOPE:
 *   Internal to resources/ — only resources.routes.js imports this.
 *
 * COVERAGE:
 *   validateCreate   — POST /resources (multipart/form-data fields)
 *   validateId       — Any route with :id param
 *   validateQuery    — GET /resources query params
 *   validateRating   — POST /resources/:id/rate body
 */

const { body, param, query } = require('express-validator');

/**
 * validateCreate — Rules for POST /resources (multipart/form-data)
 * Note: File itself is validated by multer middleware (type, size).
 * These rules validate the non-file text fields sent alongside the file.
 */
const validateCreate = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),

  body('year')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),

  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),

  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),

  body('category')
    .optional()
    .isIn(['notes', 'pyq', 'lab-manual', 'assignment', 'reference', 'other'])
    .withMessage('Category must be notes, pyq, lab-manual, assignment, reference, or other'),

  body('tags')
    .optional(),

  body('isExamPeriod')
    .optional()
    .isBoolean()
    .withMessage('isExamPeriod must be a boolean'),
];

/**
 * validateId — Rules for routes with :id param
 */
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid resource ID'),
];

/**
 * validateQuery — Rules for GET /resources query params
 */
const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('year')
    .optional()
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),

  query('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),

  query('category')
    .optional()
    .isIn(['notes', 'pyq', 'lab-manual', 'assignment', 'reference', 'other'])
    .withMessage('Invalid category'),

  query('sort')
    .optional()
    .isIn(['newest', 'most-downloaded', 'top-rated', 'exam-relevant'])
    .withMessage('Sort must be newest, most-downloaded, top-rated, or exam-relevant'),
];

/**
 * validateRating — Rules for POST /resources/:id/rate
 */
const validateRating = [
  param('id')
    .isMongoId()
    .withMessage('Invalid resource ID'),

  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
];

module.exports = {
  validateCreate,
  validateId,
  validateQuery,
  validateRating,
};
