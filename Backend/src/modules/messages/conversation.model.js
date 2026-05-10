/**
 * @file conversation.model.js — Conversation Schema
 *
 * SINGLE RESPONSIBILITY:
 *   Tracks 1-on-1 conversations between users.
 *
 * SCOPE:
 *   Internal to messages/ module.
 */

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      validate: [
        (val) => val.length === 2,
        'A direct conversation must have exactly two participants'
      ]
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index to quickly find conversations for a user
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
