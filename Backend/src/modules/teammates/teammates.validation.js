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
  body('description')
    .exists().withMessage('Description is required')
    .isString()
    .trim()
    .isLength({ min: 20, max: 2000 }).withMessage('Description must be between 20 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['hackathon', 'project', 'startup', 'competition', 'other']).withMessage('Invalid category'),
  body('techStack')
    .optional()
    .isArray().withMessage('techStack must be an array of strings'),
  body('requiredRoles')
    .optional()
    .isArray().withMessage('requiredRoles must be an array of strings'),
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
    .isString()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Contact info must be between 5 and 200 characters')
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

exports.getProjectsValidation = [
  query('status').optional().isIn(['open', 'closed', 'all']),
  query('category').optional().isString(),
  query('techStack').optional().isString(),
  query('search').optional().isString()
];
