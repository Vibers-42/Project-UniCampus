/**
 * @file events.validation.js — Express-Validator Chains for Event Routes
 */

const { body, param, query } = require('express-validator');

const validateCreate = [
  body('title')
    .trim()
    .notEmpty().withMessage('Event title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('campusId')
    .optional()
    .trim(),

  body('startDate')
    .notEmpty().withMessage('Event start date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event start date must be in the future');
      }
      return true;
    }),

  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid ISO 8601 format')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),



  body('venue')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Venue cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('category')
    .optional()
    .isIn(['workshop', 'hackathon', 'seminar', 'cultural', 'sports', 'meetup', 'club', 'other'])
    .withMessage('Invalid category'),



  body('bannerUrl')
    .optional()
    .trim()
    .isURL().withMessage('Banner URL must be a valid URL'),



  body('tags')
    .optional()
    .isArray({ max: 10 }).withMessage('Tags must be an array with at most 10 items'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 30 }).withMessage('Each tag must be a non-empty string under 30 characters'),
];

const validateUpdate = [
  param('id').isMongoId().withMessage('Invalid event ID'),
  
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('venue').optional().trim().isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('category').optional().isIn(['workshop', 'hackathon', 'seminar', 'cultural', 'sports', 'meetup', 'club', 'other']),
  body('status').optional().isIn(['upcoming', 'ongoing', 'completed', 'cancelled']),
  body('tags').optional().isArray({ max: 10 }),
];

const validateId = [
  param('id').isMongoId().withMessage('Invalid event ID'),
];

const validateQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isIn(['workshop', 'hackathon', 'seminar', 'cultural', 'sports', 'meetup', 'club', 'other']),
];

module.exports = {
  validateCreate,
  validateUpdate,
  validateId,
  validateQuery,
};
