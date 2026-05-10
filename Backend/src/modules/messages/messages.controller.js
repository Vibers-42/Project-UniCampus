/**
 * @file messages.controller.js — Messages Controller
 *
 * SINGLE RESPONSIBILITY:
 *   Handles incoming HTTP requests, extracts parameters, calls the messages service,
 *   and sends the formatted JSON response.
 */

const messagesService = require('./messages.service');
const catchAsync = require('../../middleware/catchAsync');
const AppError = require('../../shared/utils/AppError');
const { validationResult } = require('express-validator');

/**
 * Utility to check validation errors
 */
const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }
};

/**
 * Search users by roll number
 */
exports.searchUsers = catchAsync(async (req, res) => {
  checkValidation(req);
  const { rollNumber } = req.query;
  const users = await messagesService.searchUsers(rollNumber);

  res.status(200).json({
    status: 'success',
    data: { users }
  });
});

/**
 * Get all conversations for current user
 */
exports.getConversations = catchAsync(async (req, res) => {
  const conversations = await messagesService.getConversations(req.user._id);

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    data: { conversations }
  });
});

/**
 * Get or create conversation with a user
 */
exports.createConversation = catchAsync(async (req, res) => {
  checkValidation(req);
  const { receiverId } = req.body;
  const conversation = await messagesService.getOrCreateConversation(req.user._id, receiverId);

  res.status(200).json({
    status: 'success',
    data: { conversation }
  });
});

/**
 * Get messages for a specific conversation
 */
exports.getMessages = catchAsync(async (req, res) => {
  checkValidation(req);
  const { conversationId } = req.params;
  const messages = await messagesService.getMessages(conversationId, req.user._id);

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: { messages }
  });
});

/**
 * Send a message
 */
exports.sendMessage = catchAsync(async (req, res) => {
  checkValidation(req);
  const { conversationId } = req.params;
  const { content } = req.body;
  
  const message = await messagesService.sendMessage(conversationId, req.user._id, content);

  res.status(201).json({
    status: 'success',
    data: { message }
  });
});
