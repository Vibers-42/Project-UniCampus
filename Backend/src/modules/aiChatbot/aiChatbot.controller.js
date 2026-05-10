/**
 * @file aiChatbot.controller.js — AI Doubt Solver Controllers
 *
 * Thin controllers — business logic lives in aiChatbot.service.js.
 * Uses catchAsync wrapper for automatic error forwarding.
 */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./aiChatbot.service');

/** POST /ai-chatbot/ask — Send a message and get AI response */
const ask = catchAsync(async (req, res) => {
  const { message, conversationId, subject } = req.body;
  console.log('[aiChatbot] ask hit — user:', req.user.email, '| convId:', conversationId || 'NEW');
  const result = await svc.ask(req.user.email, message, conversationId, subject);
  console.log('[aiChatbot] ask success — convId:', result.conversationId);
  sendSuccess(res, result, 'AI response received');
});

/** GET /ai-chatbot/conversations — List all conversations for sidebar */
const getConversations = catchAsync(async (req, res) => {
  const conversations = await svc.getConversations(req.user.email);
  sendSuccess(res, conversations, 'Conversations fetched');
});

/** GET /ai-chatbot/conversations/:id — Get messages for a conversation */
const getMessages = catchAsync(async (req, res) => {
  const data = await svc.getMessages(req.user.email, req.params.id);
  sendSuccess(res, data, 'Messages fetched');
});

/** DELETE /ai-chatbot/conversations/:id — Delete a single conversation */
const deleteConversation = catchAsync(async (req, res) => {
  const result = await svc.deleteConversation(req.user.email, req.params.id);
  sendSuccess(res, result, result.message);
});

/** DELETE /ai-chatbot/conversations — Delete ALL conversations */
const deleteAllConversations = catchAsync(async (req, res) => {
  const result = await svc.deleteAllConversations(req.user.email);
  sendSuccess(res, result, result.message);
});

module.exports = {
  ask,
  getConversations,
  getMessages,
  deleteConversation,
  deleteAllConversations,
};
