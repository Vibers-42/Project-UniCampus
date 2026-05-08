/**
 * @file events.validation.js — Express-Validator Chains for Event Routes
 *
 * SCOPE:
 *   Internal to events/ — only events.routes.js imports this.
 *
 * USAGE:
 *   router.post('/', validateCreate, validate, ctrl.create);
 *   router.get('/:id', validateId, validate, ctrl.getById);
 */

const { body, param, query } = require('express-validator');

/**
 * validateCreate — Rules for POST /events
 * Enforces future-only dates at the validation layer as a first check.
 * (The service layer also enforces this for safety.)
 */
const validateCreate = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 format')
    .custom((value, { req }) => {
      if (req.body.date && new Date(value) <= new Date(req.body.date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('venue')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Venue cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('category')
    .optional()
    .isIn(['workshop', 'hackathon', 'seminar', 'cultural', 'sports', 'meetup', 'other'])
    .withMessage('Category must be workshop, hackathon, seminar, cultural, sports, meetup, or other'),

  body('registrationLink')
    .optional()
    .trim()
    .isURL()
    .withMessage('Registration link must be a valid URL'),

  body('bannerUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Banner URL must be a valid URL'),

  body('maxCapacity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max capacity must be a non-negative number'),

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
];

/**
 * validateUpdate — Rules for PATCH /events/:id
 * Same fields as create but all optional.
 */
const validateUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 format'),

  body('venue')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Venue cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('category')
    .optional()
    .isIn(['workshop', 'hackathon', 'seminar', 'cultural', 'sports', 'meetup', 'other'])
    .withMessage('Invalid category'),

  body('maxCapacity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max capacity must be a non-negative number'),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with at most 10 items'),
];

/**
 * validateId — Rules for routes with :id param
 */
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID'),
];

/**
 * validateQuery — Rules for GET /events query params
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

  query('category')
    .optional()
    .isIn(['workshop', 'hackathon', 'seminar', 'cultural', 'sports', 'meetup', 'other'])
    .withMessage('Invalid category'),
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateId,
  validateQuery,
};
