/** @file matching.model.js — Teammate Matching Schema */
const mongoose = require('mongoose');
const matchSchema = new mongoose.Schema({
  requestedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:        { type: String, required: true, trim: true, maxlength: 200 },
  skillsNeeded: { type: [String], default: [] },
  projectType:  { type: String, trim: true, default: '' },
  urgency:      { type: Boolean, default: false },
  deadline:     { type: Date },
  status:       { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  matches:      [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  }],
}, { timestamps: true });
matchSchema.index({ skillsNeeded: 1 });
module.exports = mongoose.model('MatchRequest', matchSchema);
