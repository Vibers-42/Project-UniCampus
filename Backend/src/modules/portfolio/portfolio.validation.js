/**
 * @file portfolio.validation.js — Portfolio Validations
 */

const { body, param } = require('express-validator');

exports.updatePortfolioValidation = [
  body('bio').optional().isString().trim().isLength({ max: 1000 }),
  body('profileImage').optional().isURL(),
  body('skills').optional().isArray(),
  body('techStack').optional().isArray(),
  body('tools').optional().isArray(),
  body('domains').optional().isArray(),
  body('socialLinks').optional().isObject(),
  body('resumeUrl').optional().isURL(),
  body('cgpa').optional().isFloat({ min: 0, max: 10 }),
];

exports.addProjectValidation = [
  body('title').exists().isString().trim(),
  body('description').exists().isString().trim(),
  body('techStack').optional().isArray(),
  body('githubLink').optional().isString().trim(),
  body('liveLink').optional().isString().trim(),
  body('image').optional().isURL(),
  body('status').optional().isIn(['ongoing', 'completed'])
];

exports.addExperienceValidation = [
  body('title').exists().isString().trim(),
  body('organization').exists().isString().trim(),
  body('description').optional().isString().trim(),
  body('startDate').exists().isISO8601(),
  body('endDate').optional({ nullable: true }).isISO8601(),
  body('type').optional().isIn(['internship', 'campus_role', 'club_position', 'freelance', 'research', 'other']),
  body('isCurrent').optional().isBoolean()
];

exports.addAchievementValidation = [
  body('title').exists().isString().trim(),
  body('description').optional().isString().trim(),
  body('issuer').optional().isString().trim(),
  body('date').exists().isISO8601(),
  body('link').optional().isURL()
];

exports.rollNumberValidation = [
  param('rollNumber').exists().isString().trim()
];

exports.idValidation = [
  param('id').isMongoId().withMessage('Invalid ID format')
];
