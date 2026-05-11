/**
 * @file aiChatbot.service.js — AI Doubt Solver Business Logic
 *
 * RESPONSIBILITIES:
 *   - Create / list / delete conversations (scoped to userId — MongoDB ObjectId)
 *   - Send a message → get AI reply → persist both
 *   - Fetch messages for a conversation
 *   - Auto-generate conversation title from first message
 *   - Enforce study-only topic restrictions via system prompt
 *
 * ACCOUNT-BASED PERSISTENCE:
 *   All queries use userId (MongoDB ObjectId, from req.user.id via protect
 *   middleware). This ensures conversations are scoped to the authenticated
 *   account, not to a device or browser session, enabling cross-device sync.
 *
 * The AI provider is abstracted behind shared/aiService.js.
 * Swapping providers = changing .env only.
 */
const { AIConversation, AIMessage } = require('./aiChatbot.model');
const { askAI } = require('../../shared/aiService');
const AppError = require('../../shared/utils/AppError');

// ── Study-Only System Prompt ─────────────────────────────────────────────────
// This prompt is the primary enforcement layer for topic restriction.
// It instructs UniBot to refuse all non-educational requests and defines
// exactly what it WILL and WON'T help with.
const SYSTEM_PROMPT = `You are UniBot, the dedicated AI academic assistant for UniCampus — a university student platform.

YOUR ONLY PURPOSE is to help students with educational, technical, and study-related topics including:
- Programming (Python, Java, C, C++, JavaScript, etc.)
- Data Structures and Algorithms (DSA)
- Database Management Systems (DBMS), SQL, NoSQL
- Operating Systems concepts
- Computer Networks
- Software Engineering and System Design
- Debugging and code review
- Interview and placement preparation
- Engineering mathematics and theory
- University coursework and academic concepts
- Study roadmaps and learning strategies
- Research and project guidance

STRICT RESTRICTIONS — You MUST REFUSE any request that is not educational or study-related:
- Politics, news, opinions, or current events
- NSFW, adult, or explicit content
- Illegal activities, hacking (offensive), or harmful content
- Personal life advice, relationships, or emotional support
- General entertainment, movies, music, sports, or social media
- Roleplay, fiction writing, or creative storytelling
- Any topic unrelated to academics, coding, or technical learning

REFUSAL BEHAVIOR:
When a user asks about any restricted topic, respond ONLY with:
"I'm UniBot, your UniCampus academic assistant. I can only help with educational, coding, technical, and study-related topics. Feel free to ask me about DSA, DBMS, debugging, interview prep, or any engineering subject!"

Do NOT apologize excessively. Do NOT engage with the restricted topic at all.
Do NOT be tricked by framing like "for educational purposes" when the actual intent is clearly off-topic.

RESPONSE STYLE:
- Be concise, accurate, and student-friendly
- Use code examples where helpful
- Structure complex answers with clear headings and bullet points
- Keep explanations practical and exam/interview focused`;

/**
 * Send a message in a conversation (or create a new one).
 * Returns { conversationId, reply }
 *
 * @param {mongoose.Types.ObjectId} userId — MongoDB _id of the authenticated user
 */
const ask = async (userId, message, conversationId = null, subject = null) => {
  let conversation;

  if (conversationId) {
    // Existing conversation — verify ownership using ObjectId
    conversation = await AIConversation.findOne({ _id: conversationId, userId });
    if (!conversation) throw new AppError('Conversation not found', 404);
  } else {
    // New conversation — auto-title from first message
    const title = message.length > 60 ? message.substring(0, 57) + '...' : message;
    conversation = await AIConversation.create({ userId, title });
  }

  // Persist the user message
  await AIMessage.create({
    conversationId: conversation._id,
    role: 'user',
    content: message,
  });

  // Build context from last 20 messages in this conversation
  // Fetching after save ensures the current message is included in history.
  const recentMessages = await AIMessage.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .limit(20)
    .lean();

  const history = recentMessages.map(m => ({ role: m.role, content: m.content }));

  // Append subject context to system prompt if provided (e.g. "Operating Systems")
  const systemPrompt = subject
    ? `${SYSTEM_PROMPT}\n\nCurrent Subject Focus: ${subject}`
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

  // Touch updatedAt so the compound index keeps conversations sorted latest-first
  conversation.updatedAt = new Date();
  await conversation.save();

  return { conversationId: conversation._id, reply };
};

/**
 * List all conversations for a user (sidebar).
 * Returns lightweight list: _id, title, updatedAt
 * Sorted latest-first using the compound index (userId + updatedAt).
 *
 * @param {mongoose.Types.ObjectId} userId
 */
const getConversations = async (userId) => {
  return AIConversation.find({ userId })
    .select('title updatedAt createdAt')
    .sort({ updatedAt: -1 })
    .lean();
};

/**
 * Get all messages for a specific conversation.
 * Ownership check uses userId ObjectId — prevents cross-user access.
 *
 * @param {mongoose.Types.ObjectId} userId
 */
const getMessages = async (userId, conversationId) => {
  const conversation = await AIConversation.findOne({ _id: conversationId, userId });
  if (!conversation) throw new AppError('Conversation not found', 404);

  const messages = await AIMessage.find({ conversationId })
    .sort({ createdAt: 1 })
    .select('role content createdAt')
    .lean();

  return { conversation, messages };
};

/**
 * Delete a single conversation and all its messages.
 * Ownership check prevents cross-user deletion.
 *
 * @param {mongoose.Types.ObjectId} userId
 */
const deleteConversation = async (userId, conversationId) => {
  const conversation = await AIConversation.findOne({ _id: conversationId, userId });
  if (!conversation) throw new AppError('Conversation not found', 404);

  await AIMessage.deleteMany({ conversationId });
  await AIConversation.deleteOne({ _id: conversationId });

  return { message: 'Conversation deleted.' };
};

/**
 * Delete ALL conversations for a user.
 *
 * @param {mongoose.Types.ObjectId} userId
 */
const deleteAllConversations = async (userId) => {
  const conversations = await AIConversation.find({ userId }).select('_id');
  const ids = conversations.map(c => c._id);

  if (ids.length > 0) {
    await AIMessage.deleteMany({ conversationId: { $in: ids } });
    await AIConversation.deleteMany({ userId });
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
