/**
 * @file teammates.validation.js — Teammates Request Validation
 */

const { body, param, query } = require('express-validator');

exports.createProjectValidation = [
  body('title')
    .exists().withMessage('Title is required')
    .isString().withMessage('Title must be text')
    .trim()
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('shortDescription')
    .exists().withMessage('Short description is required')
    .isString().trim()
    .isLength({ min: 10, max: 300 }).withMessage('Short description must be between 10 and 300 characters'),
  body('detailedDescription')
    .exists().withMessage('Detailed description is required')
    .isString().trim()
    .isLength({ min: 20, max: 5000 }).withMessage('Detailed description must be between 20 and 5000 characters'),
  body('problemStatement')
    .exists().withMessage('Problem statement is required')
    .isString().trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Problem statement must be between 10 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['hackathon', 'project', 'startup', 'competition', 'open source', 'research', 'freelance', 'college project', 'other']).withMessage('Invalid category'),
  body('techStack').optional().isArray().withMessage('techStack must be an array of strings'),
  body('requiredRoles').optional().isArray().withMessage('requiredRoles must be an array of strings'),
  body('requiredSkills').optional().isArray().withMessage('requiredSkills must be an array of strings'),
  body('currentTeamSize')
    .optional()
    .isInt({ min: 1 }).withMessage('currentTeamSize must be at least 1')
    .toInt(),
  body('requiredTeamSize')
    .exists().withMessage('requiredTeamSize is required')
    .isInt({ min: 2 }).withMessage('requiredTeamSize must be at least 2')
    .toInt(),
  body('contactInfo')
    .exists().withMessage('Contact info is required')
    .isString().trim()
    .isLength({ min: 5, max: 200 }).withMessage('Contact info must be between 5 and 200 characters'),
  body('deadline')
    .exists().withMessage('Deadline is required')
    .isISO8601().withMessage('Deadline must be a valid date'),
  body('attachments').optional().isArray(),
  body('githubLink').optional().isString().trim(),
  body('figmaLink').optional().isString().trim(),
  body('referenceLinks').optional().isArray()
];

exports.updateStatusValidation = [
  param('id')
    .isMongoId().withMessage('Invalid project ID'),
  body('status')
    .exists().withMessage('Status is required')
    .isIn(['open', 'closed']).withMessage('Status must be either open or closed')
];

exports.projectIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid project ID')
];

exports.updateProjectValidation = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('title').optional().isString().trim().isLength({ min: 5, max: 100 }),
  body('shortDescription').optional().isString().trim().isLength({ min: 10, max: 300 }),
  body('detailedDescription').optional().isString().trim().isLength({ min: 20, max: 5000 }),
  body('problemStatement').optional().isString().trim().isLength({ min: 10, max: 2000 }),
  body('category').optional().isIn(['hackathon', 'project', 'startup', 'competition', 'open source', 'research', 'freelance', 'college project', 'other']),
  body('techStack').optional().isArray(),
  body('requiredRoles').optional().isArray(),
  body('requiredSkills').optional().isArray(),
  body('currentTeamSize').optional().isInt({ min: 1 }).toInt(),
  body('requiredTeamSize').optional().isInt({ min: 2 }).toInt(),
  body('contactInfo').optional().isString().trim().isLength({ min: 5, max: 200 }),
  body('deadline').optional().isISO8601(),
  body('attachments').optional().isArray(),
  body('githubLink').optional().isString().trim(),
  body('figmaLink').optional().isString().trim(),
  body('referenceLinks').optional().isArray()
];

exports.getProjectsValidation = [
  query('status').optional().isIn(['open', 'closed', 'all']),
  query('category').optional().isString(),
  query('techStack').optional().isString(),
  query('search').optional().isString()
];
