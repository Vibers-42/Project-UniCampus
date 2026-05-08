/** @file aiChatbot.model.js — Chat Session Schema (scaffold) */
const mongoose = require('mongoose');
const chatSessionSchema = new mongoose.Schema({
  userId:   { type: String, required: true, index: true }, // email ref
  messages: [{
    role:      { type: String, enum: ['user', 'assistant'], required: true },
    content:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  subject:   { type: String, default: 'New Chat', trim: true },
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });
module.exports = mongoose.model('ChatSession', chatSessionSchema);
