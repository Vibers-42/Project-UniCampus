/** @file opportunities.validation.js */
const { body, param } = require('express-validator');
const validateCreate = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['internship', 'referral', 'hackathon', 'research', 'club']).withMessage('Invalid type'),
  body('deadline').optional().isISO8601(),
];
const validateId = [param('id').isMongoId().withMessage('Invalid ID')];
module.exports = { validateCreate, validateId };
