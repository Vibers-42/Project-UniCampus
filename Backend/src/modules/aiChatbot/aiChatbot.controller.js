/**
 * @file aiChatbot.controller.js — AI Doubt Solver Controllers
 *
 * Thin controllers — business logic lives in aiChatbot.service.js.
 * Uses catchAsync wrapper for automatic error forwarding.
 *
 * Identity source: req.user.id (MongoDB ObjectId from protect middleware).
 * All service calls use the ObjectId, NOT email, ensuring conversations
 * are account-bound and not device/email-bound.
 */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./aiChatbot.service');

/** POST /ai-chatbot/ask — Send a message and get AI response */
const ask = catchAsync(async (req, res) => {
  const { message, conversationId, subject } = req.body;
  const result = await svc.ask(req.user.id, message, conversationId, subject);
  sendSuccess(res, result, 'AI response received');
});

/** GET /ai-chatbot/conversations — List all conversations for sidebar */
const getConversations = catchAsync(async (req, res) => {
  const conversations = await svc.getConversations(req.user.id);
  sendSuccess(res, conversations, 'Conversations fetched');
});

/** GET /ai-chatbot/conversations/:id — Get messages for a conversation */
const getMessages = catchAsync(async (req, res) => {
  const data = await svc.getMessages(req.user.id, req.params.id);
  sendSuccess(res, data, 'Messages fetched');
});

/** DELETE /ai-chatbot/conversations/:id — Delete a single conversation */
const deleteConversation = catchAsync(async (req, res) => {
  const result = await svc.deleteConversation(req.user.id, req.params.id);
  sendSuccess(res, result, result.message);
});

/** DELETE /ai-chatbot/conversations — Delete ALL conversations */
const deleteAllConversations = catchAsync(async (req, res) => {
  const result = await svc.deleteAllConversations(req.user.id);
  sendSuccess(res, result, result.message);
});

module.exports = {
  ask,
  getConversations,
  getMessages,
  deleteConversation,
  deleteAllConversations,
};
