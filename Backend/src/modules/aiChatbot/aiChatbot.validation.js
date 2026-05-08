/** @file aiChatbot.validation.js */
const { body } = require('express-validator');
const validateAsk = [
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
  body('sessionId').optional().isMongoId().withMessage('Invalid session ID'),
];
module.exports = { validateAsk };
