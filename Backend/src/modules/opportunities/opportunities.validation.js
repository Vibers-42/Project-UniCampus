const { body, param, query } = require('express-validator');

const validateCreate = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 3000 }),
  body('type').isIn(['Internship', 'Placement Drive', 'Club Recruitment', 'Campus Ambassador', 'Alumni Referral', 'Workshop Opportunity', 'Certification Program', 'Hackathon Opportunity', 'Other']).withMessage('Invalid type'),
  body('organization').trim().notEmpty().withMessage('Organization is required'),
  body('eligibility').optional().trim(),
  body('deadline').optional().isISO8601().toDate(),
  body('applyLink').optional().isURL().withMessage('Must be a valid URL'),
  body('tags').optional().isArray(),
  body('banner').optional().isURL().withMessage('Must be a valid Cloudinary URL'),
  body('alumniName').optional().trim(),
  body('role').optional().trim(),
  body('referralStatus').optional().isIn(['Open', 'Closed'])
];

const validateId = [
  param('id').isMongoId().withMessage('Invalid ID')
];

const validateQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('type').optional().isString(),
  query('search').optional().isString()
];

module.exports = { validateCreate, validateId, validateQuery };
