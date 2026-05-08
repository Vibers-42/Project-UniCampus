/** @file marketplace.validation.js */
const { body, param } = require('express-validator');
const validateCreate = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('imageUrls').optional().isArray({ max: 3 }).withMessage('Max 3 images'),
  body('imageUrls.*').optional().isURL(),
];
const validateId = [param('id').isMongoId().withMessage('Invalid listing ID')];
module.exports = { validateCreate, validateId };
