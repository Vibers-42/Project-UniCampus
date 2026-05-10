/**
 * @file aiChatbot.routes.js — AI Doubt Solver Routes
 *
 * All routes require authentication (protect middleware).
 * Students can only access their own conversations.
 *
 * ROUTE MAP:
 *   POST   /ai-chatbot/ask                    — Send message, get AI reply
 *   GET    /ai-chatbot/conversations          — List all conversations (sidebar)
 *   GET    /ai-chatbot/conversations/:id      — Get messages for a conversation
 *   DELETE /ai-chatbot/conversations/:id      — Delete a single conversation
 *   DELETE /ai-chatbot/conversations          — Delete all conversations
 */
const { Router } = require('express');
const ctrl = require('./aiChatbot.controller');
const { validateAsk, validateConversationId } = require('./aiChatbot.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();
router.use(protect);

// Send a doubt / follow-up
router.post('/ask', validateAsk, validate, ctrl.ask);

// Conversation management
router.get('/conversations', ctrl.getConversations);
router.get('/conversations/:id', validateConversationId, validate, ctrl.getMessages);
router.delete('/conversations/:id', validateConversationId, validate, ctrl.deleteConversation);
router.delete('/conversations', ctrl.deleteAllConversations);

module.exports = router;
