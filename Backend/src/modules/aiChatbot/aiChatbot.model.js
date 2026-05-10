/**
 * @file aiChatbot.model.js — AI Doubt Solver Schemas
 *
 * Two collections:
 *   AIConversation — one per chat thread (title, userId, timestamps)
 *   AIMessage      — individual messages within a conversation
 *
 * Separation keeps conversation listing fast (no embedded array bloat)
 * and messages independently indexable for future search.
 */
const mongoose = require('mongoose');

// ── AIConversation ──
const aiConversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // email ref
  title:  { type: String, default: 'New Chat', trim: true, maxlength: 120 },
}, { timestamps: true });

// ── AIMessage ──
const aiMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIConversation',
    required: true,
    index: true,
  },
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
const AIMessage      = mongoose.model('AIMessage', aiMessageSchema);

module.exports = { AIConversation, AIMessage };
