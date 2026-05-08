/** @file studyGroups.model.js — Study Groups + Messages Schema (scaffold) */
const mongoose = require('mongoose');

// ── Study Group Schema ──
const studyGroupSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true, maxlength: 100 },
  subject:          { type: String, required: true, trim: true },
  department:       { type: String, trim: true, default: '', index: true },
  semester:         { type: Number, min: 1, max: 8 },
  members:          { type: [String], default: [] }, // emails
  createdBy:        { type: String, required: true, index: true }, // email ref
  pinnedResources:  { type: [String], default: [] }, // URLs or resource IDs
}, { timestamps: true });
studyGroupSchema.index({ name: 'text', subject: 'text' });

// ── Group Message Schema (separate collection) ──
const messageSchema = new mongoose.Schema({
  groupId:   { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true, index: true },
  sender:    { type: String, required: true }, // email ref
  content:   { type: String, required: true, maxlength: 2000 },
  fileUrl:   { type: String, default: '' }, // optional attachment
  createdAt: { type: Date, default: Date.now, index: true },
});

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);
const GroupMessage = mongoose.model('GroupMessage', messageSchema);

module.exports = { StudyGroup, GroupMessage };
