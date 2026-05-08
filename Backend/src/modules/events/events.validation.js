/** @file events.validation.js */
const { body, param } = require('express-validator');
const validateCreate = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('date').notEmpty().isISO8601().withMessage('Valid date is required'),
  body('venue').optional().trim(),
];
const validateId = [param('id').isMongoId().withMessage('Invalid event ID')];
module.exports = { validateCreate, validateId };
