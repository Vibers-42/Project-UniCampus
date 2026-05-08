/** @file matching.validation.js */
const { body, param } = require('express-validator');
const validateCreate = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('skillsNeeded').optional().isArray(),
];
const validateId = [param('id').isMongoId().withMessage('Invalid ID')];
module.exports = { validateCreate, validateId };
