/**
 * @file aiChatbot.model.js — AI Doubt Solver Schemas
 *
 * Two collections:
 *   AIConversation — one per chat thread (title, userId, timestamps)
 *   AIMessage      — individual messages within a conversation
 *
 * Separation keeps conversation listing fast (no embedded array bloat)
 * and messages independently indexable for future search.
 *
 * userId stores the MongoDB _id of the User document (ObjectId).
 * This ties conversations to accounts, not devices or emails,
 * enabling cross-device sync after login.
 */
const mongoose = require('mongoose');

// ── AIConversation ──────────────────────────────────────────────────────────
const aiConversationSchema = new mongoose.Schema({
  // Linked to the authenticated User's MongoDB _id.
  // Using ObjectId (not email) ensures referential integrity and
  // allows efficient indexed lookups via the userId index.
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, default: 'New Chat', trim: true, maxlength: 120 },
}, { timestamps: true });

// Index for fast per-user conversation listing sorted by latest-first.
// The compound index (userId + updatedAt) covers the primary query:
//   AIConversation.find({ userId }).sort({ updatedAt: -1 })
aiConversationSchema.index({ userId: 1, updatedAt: -1 });

// ── AIMessage ───────────────────────────────────────────────────────────────
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
