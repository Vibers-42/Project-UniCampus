/**
 * @file resources.validation.js — Express-Validator Chains for Resource Routes
 *
 * SCOPE:
 *   Internal to resources/ — only resources.routes.js imports this.
 *
 * USAGE:
 *   router.post('/', validateCreate, validate, ctrl.create);
 *   router.get('/:id', validateId, validate, ctrl.getById);
 */

const { body, param, query } = require('express-validator');

/**
 * validateCreate — Rules for POST /resources
 */
const validateCreate = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('pdfUrl')
    .trim()
    .notEmpty()
    .withMessage('PDF URL is required')
    .isURL()
    .withMessage('PDF URL must be a valid URL'),

  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),

  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),

  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with at most 10 items'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be a non-empty string under 30 characters'),

  body('fileSize')
    .optional()
    .isInt({ min: 0 })
    .withMessage('File size must be a non-negative number'),

  body('resourceType')
    .optional()
    .isIn(['notes', 'past-paper', 'assignment', 'syllabus', 'other'])
    .withMessage('Resource type must be notes, past-paper, assignment, syllabus, or other'),
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
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),

  query('resourceType')
    .optional()
    .isIn(['notes', 'past-paper', 'assignment', 'syllabus', 'other'])
    .withMessage('Invalid resource type'),
];

module.exports = {
  validateCreate,
  validateId,
  validateQuery,
};
