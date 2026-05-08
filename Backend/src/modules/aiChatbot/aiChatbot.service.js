/** @file aiChatbot.service.js (scaffold) */
const ChatSession = require('./aiChatbot.model');
const { askAI } = require('../../shared/aiService');
const AppError = require('../../shared/utils/AppError');

const SYSTEM_PROMPT = 'You are UniBot, a helpful AI assistant for UniCampus — a university student platform. Help students with academic questions, campus info, study tips, and general guidance. Be friendly, concise, and helpful.';

const ask = async (email, message, sessionId = null) => {
  let session;
  if (sessionId) {
    session = await ChatSession.findOne({ _id: sessionId, userId: email });
    if (!session) throw new AppError('Chat session not found', 404);
  } else {
    session = await ChatSession.create({ userId: email, subject: message.substring(0, 50) });
  }

  session.messages.push({ role: 'user', content: message });

  // Build conversation history for context
  const history = session.messages.slice(-20).map(m => ({ role: m.role, content: m.content }));
  const aiResult = await askAI(SYSTEM_PROMPT, message, history);

  const reply = aiResult.success ? aiResult.reply : 'AI service is currently unavailable. Please try again later.';
  session.messages.push({ role: 'assistant', content: reply });
  await session.save();

  return { sessionId: session._id, reply };
};

const getHistory = async (email) => {
  return ChatSession.find({ userId: email }).select('subject createdAt').sort({ createdAt: -1 });
};

const deleteHistory = async (email) => {
  await ChatSession.deleteMany({ userId: email });
  return { message: 'Chat history deleted.' };
};

module.exports = { ask, getHistory, deleteHistory };
