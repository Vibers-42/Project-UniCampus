const mongoose = require('mongoose');

const GroupThreadSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  topic: { type: String },
  isPinned: { type: Boolean, default: false },
  messageCount: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GroupThread', GroupThreadSchema);
