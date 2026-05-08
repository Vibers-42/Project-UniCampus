/** @file studyGroups.validation.js */
const { body, param } = require('express-validator');
const validateCreate = [
  body('name').trim().notEmpty().withMessage('Group name is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('semester').optional().isInt({ min: 1, max: 8 }),
];
const validateId = [param('id').isMongoId().withMessage('Invalid group ID')];
const validateMessage = [
  param('id').isMongoId().withMessage('Invalid group ID'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('fileUrl').optional().isURL(),
];
module.exports = { validateCreate, validateId, validateMessage };
