/** @file notifications.model.js — Notifications Schema (scaffold) */
const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  userId:   { type: String, required: true, index: true }, // email ref
  type:     { type: String, required: true }, // e.g. 'event_reminder', 'new_match', 'system'
  message:  { type: String, required: true, maxlength: 500 },
  isRead:   { type: Boolean, default: false, index: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // flexible payload
}, { timestamps: true });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', notificationSchema);
