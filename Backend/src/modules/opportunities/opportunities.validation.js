const { body, param, query } = require('express-validator');

const validateCreate = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 3000 }),
  body('type').isIn([
    'Internship', 'Placement Drive', 'Club Recruitment', 'Campus Ambassador', 
    'Alumni Referral', 'Workshop Opportunity', 'Certification Program', 
    'Hackathon Opportunity', 'Hackathons', 'Workshops', 'Research Opportunities', 
    'Certifications', 'Startup Internships', 'Student Chapters', 'Technical Events', 
    'Volunteer Programs', 'Other'
  ]).withMessage('Invalid type'),
  body('organization').trim().notEmpty().withMessage('Organization is required'),
  body('eligibility').optional().trim(),
  body('departments').optional().isArray(),
  body('yearsEligible').optional().isArray(),
  body('mode').optional().isIn(['Online', 'Offline', 'Hybrid']),
  body('stipend').optional().trim(),
  body('facultyCoordinator').optional().trim(),
  body('facultyContact').optional().trim(),
  body('studentCoordinator').optional().trim(),
  body('studentContact').optional().trim(),
  body('responsibilities').optional().trim(),
  body('requirements').optional().trim(),
  body('applicationProcess').optional().trim(),
  body('attachments').optional().isArray(),
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
  query('search').optional().isString(),
  query('department').optional().isString(),
  query('year').optional().isString()
];

module.exports = { validateCreate, validateId, validateQuery };
