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

const SYSTEM_PROMPT = `You are UniBot, the AI Doubt Solver for UniCampus — a university student platform.

Your purpose:
- Help students with academic doubts, coding problems, project guidance
- Provide clear explanations with examples
- Support markdown formatting and code blocks in responses
- Be concise but thorough

Rules:
- Always format code in proper markdown code blocks with language tags
- Use bullet points and headers for structured explanations
- Stay focused on academic/educational topics
- Be encouraging and supportive
- If asked something non-academic, gently redirect to academic topics`;

/**
 * Send a message in a conversation (or create a new one).
 * Returns { conversationId, reply }
 */
const ask = async (email, message, conversationId = null) => {
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

  // Call AI provider
  const aiResult = await askAI(SYSTEM_PROMPT, message, history);

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
