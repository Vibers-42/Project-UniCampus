const { body, param, query } = require('express-validator');

const validateCreatePost = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 2000 })
    .withMessage('Content cannot exceed 2000 characters'),
  body('images').optional().isArray(),
  body('images.*.url').optional().isString().isURL().withMessage('Image URL must be valid'),
  body('images.*.publicId').optional().isString(),
  body('images.*.fileType').optional().isString(),
  body('tags').optional().isArray({ max: 10 }).withMessage('Maximum 10 tags allowed'),
  body('tags.*').optional().isString().trim().isLength({ max: 50 }).withMessage('Tag cannot exceed 50 characters'),
  body('type').optional().isIn(['General', 'Resource', 'Discussion', 'Event', 'Marketplace']),
  // Content-targeting fields (optional — auto-populated from author profile if omitted)
  body('targetDepartment').optional().isString().trim().isLength({ max: 100 }),
  body('targetYearOfStudy').optional().isInt({ min: 1, max: 4 }),
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
