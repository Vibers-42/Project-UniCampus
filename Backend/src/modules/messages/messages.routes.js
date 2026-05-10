/**
 * @file messages.routes.js — Messages Module Routes
 */

const { Router } = require('express');
const messagesController = require('./messages.controller');
const validation = require('./messages.validation');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

// All message routes require authentication
router.use(protect);

// User search
router.get('/search', validation.searchUsersValidation, messagesController.searchUsers);

// Conversations
router.route('/conversations')
  .get(messagesController.getConversations)
  .post(validation.createConversationValidation, messagesController.createConversation);

// Messages within a conversation
router.route('/conversations/:conversationId/messages')
  .get(validation.getMessagesValidation, messagesController.getMessages)
  .post(validation.sendMessageValidation, messagesController.sendMessage);

module.exports = router;
