const { body, param, query } = require('express-validator');

const validateCreatePost = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 2000 })
    .withMessage('Content cannot exceed 2000 characters'),
  body('images').optional().isArray(),
  body('images.*').optional().isString().isURL().withMessage('Images must be valid URLs'),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString().trim(),
  body('type').optional().isIn(['General', 'Resource', 'Discussion', 'Event', 'Marketplace'])
];

const validateCreateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 1000 })
    .withMessage('Content cannot exceed 1000 characters')
];

const validateId = [
  param('id').isMongoId().withMessage('Invalid ID')
];

const validateQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('type').optional().isIn(['All', 'General', 'Resource', 'Discussion', 'Event', 'Marketplace'])
];

module.exports = {
  validateCreatePost,
  validateCreateComment,
  validateId,
  validateQuery
};
