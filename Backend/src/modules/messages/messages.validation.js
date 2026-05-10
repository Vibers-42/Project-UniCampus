/**
 * @file messages.validation.js — Messages Validation Rules
 */

const { body, query, param } = require('express-validator');

exports.searchUsersValidation = [
  query('rollNumber')
    .optional()
    .isString().withMessage('Roll number must be a string')
    .trim()
    .isLength({ min: 1 }).withMessage('Roll number cannot be empty')
];

exports.createConversationValidation = [
  body('receiverId')
    .exists().withMessage('receiverId is required')
    .isMongoId().withMessage('Invalid receiver ID format')
];

exports.getMessagesValidation = [
  param('conversationId')
    .exists().withMessage('conversationId is required')
    .isMongoId().withMessage('Invalid conversation ID format')
];

exports.sendMessageValidation = [
  param('conversationId')
    .exists().withMessage('conversationId is required')
    .isMongoId().withMessage('Invalid conversation ID format'),
  body('content')
    .exists().withMessage('Message content is required')
    .isString().withMessage('Content must be text')
    .trim()
    .isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters')
];
