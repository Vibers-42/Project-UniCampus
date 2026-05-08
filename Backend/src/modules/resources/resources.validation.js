/** @file resources.validation.js */
const { body, param } = require('express-validator');
const validateCreate = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('pdfUrl').trim().notEmpty().withMessage('PDF URL is required').isURL(),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('semester').optional().isInt({ min: 1, max: 8 }),
  body('tags').optional().isArray({ max: 10 }),
];
const validateId = [param('id').isMongoId().withMessage('Invalid resource ID')];
module.exports = { validateCreate, validateId };
