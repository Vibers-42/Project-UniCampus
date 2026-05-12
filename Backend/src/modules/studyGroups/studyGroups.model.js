/** @file studyGroups.model.js — Study Groups + Messages Schema */
const mongoose = require('mongoose');

// ── Study Group Schema ──
const studyGroupSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true, maxlength: 100 },
  description:      { type: String, trim: true, default: '', maxlength: 500 },
  category:         { type: String, required: true, trim: true },
  members:          { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  memberCount:      { type: Number, default: 0 },
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });
studyGroupSchema.index({ name: 'text', category: 'text' });

// ── Group Message Schema (separate collection) ──
const messageSchema = new mongoose.Schema({
  groupId:   { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true, index: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now, index: true },
});

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);
const GroupMessage = mongoose.model('GroupMessage', messageSchema);

module.exports = { StudyGroup, GroupMessage };
