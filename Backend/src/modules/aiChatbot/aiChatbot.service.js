/**
 * @file aiChatbot.service.js — AI Doubt Solver Business Logic
 *
 * RESPONSIBILITIES:
 *   - Create / list / delete conversations (scoped to userId)
 *   - Send a message → get AI reply → persist both
 *   - Fetch messages for a conversation
 *   - Auto-generate conversation title from first message
 *
 * The AI provider is abstracted behind shared/aiService.js.
 * Swapping providers = changing .env only.
 */
const { AIConversation, AIMessage } = require('./aiChatbot.model');
const { askAI } = require('../../shared/aiService');
const AppError = require('../../shared/utils/AppError');

const SYSTEM_PROMPT = `You are UniBot, the AI academic assistant for UniCampus students.

Help students with:
- programming
- DBMS
- DSA
- operating systems
- coding bugs
- debugging
- interview preparation
- academic concepts

Explain concepts clearly, accurately, and simply.

Keep responses concise, practical, and student-friendly.`;

/**
 * Send a message in a conversation (or create a new one).
 * Returns { conversationId, reply }
 */
const ask = async (email, message, conversationId = null, subject = null) => {
  let conversation;

  if (conversationId) {
    // Existing conversation — verify ownership
    conversation = await AIConversation.findOne({ _id: conversationId, userId: email });
    if (!conversation) throw new AppError('Conversation not found', 404);
  } else {
    // New conversation — auto-title from first message
    const title = message.length > 60 ? message.substring(0, 57) + '...' : message;
    conversation = await AIConversation.create({ userId: email, title });
  }

  // Persist the user message
  await AIMessage.create({
    conversationId: conversation._id,
    role: 'user',
    content: message,
  });

  // Build context from last 20 messages in this conversation
  const recentMessages = await AIMessage.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .limit(20)
    .lean();

  const history = recentMessages.map(m => ({ role: m.role, content: m.content }));

  // Append subject context to system prompt if provided
  const systemPrompt = subject
    ? `${SYSTEM_PROMPT}\n\nCurrent Subject: ${subject}`
    : SYSTEM_PROMPT;

  // Call AI provider
  const aiResult = await askAI(systemPrompt, message, history);

  const reply = aiResult.success
    ? aiResult.reply
    : 'I\'m having trouble connecting right now. Please try again in a moment.';

  // Persist the AI reply
  await AIMessage.create({
    conversationId: conversation._id,
    role: 'assistant',
    content: reply,
  });

  // Touch conversation updatedAt
  conversation.updatedAt = new Date();
  await conversation.save();

  return { conversationId: conversation._id, reply };
};

/**
 * List all conversations for a user (sidebar).
 * Returns lightweight list: _id, title, updatedAt
 */
const getConversations = async (email) => {
  return AIConversation.find({ userId: email })
    .select('title updatedAt createdAt')
    .sort({ updatedAt: -1 })
    .lean();
};

/**
 * Get all messages for a specific conversation.
 * Enforces ownership check.
 */
const getMessages = async (email, conversationId) => {
  const conversation = await AIConversation.findOne({ _id: conversationId, userId: email });
  if (!conversation) throw new AppError('Conversation not found', 404);

  const messages = await AIMessage.find({ conversationId })
    .sort({ createdAt: 1 })
    .select('role content createdAt')
    .lean();

  return { conversation, messages };
};

/**
 * Delete a single conversation and all its messages.
 */
const deleteConversation = async (email, conversationId) => {
  const conversation = await AIConversation.findOne({ _id: conversationId, userId: email });
  if (!conversation) throw new AppError('Conversation not found', 404);

  await AIMessage.deleteMany({ conversationId });
  await AIConversation.deleteOne({ _id: conversationId });

  return { message: 'Conversation deleted.' };
};

/**
 * Delete ALL conversations for a user.
 */
const deleteAllConversations = async (email) => {
  const conversations = await AIConversation.find({ userId: email }).select('_id');
  const ids = conversations.map(c => c._id);

  if (ids.length > 0) {
    await AIMessage.deleteMany({ conversationId: { $in: ids } });
    await AIConversation.deleteMany({ userId: email });
  }

  return { message: 'All conversations deleted.' };
};

module.exports = {
  ask,
  getConversations,
  getMessages,
  deleteConversation,
  deleteAllConversations,
};
