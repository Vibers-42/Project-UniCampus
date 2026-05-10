/**
 * @file aiChatbot.validation.js — Input validation for AI Doubt Solver
 */
const { body, param } = require('express-validator');

const validateAsk = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 4000 }).withMessage('Message cannot exceed 4000 characters'),
  body('conversationId')
    .optional({ values: 'null' })
    .isMongoId().withMessage('Invalid conversation ID'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Subject cannot exceed 100 characters'),
];

const validateConversationId = [
  param('id')
    .isMongoId().withMessage('Invalid conversation ID'),
];

module.exports = { validateAsk, validateConversationId };
