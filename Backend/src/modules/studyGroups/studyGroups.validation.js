/** @file studyGroups.validation.js */
const { body, param } = require('express-validator');
const validateCreate = [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('description').optional().trim(),
  body('category').trim().notEmpty().withMessage('Category is required'),
];
const validateId = [param('id').isMongoId().withMessage('Invalid group ID')];
const validateMessage = [
  param('id').isMongoId().withMessage('Invalid group ID'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
];
module.exports = { validateCreate, validateId, validateMessage };
