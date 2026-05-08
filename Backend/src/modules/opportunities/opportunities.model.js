/** @file opportunities.model.js — Opportunity Board Schema (scaffold) */
const mongoose = require('mongoose');
const oppsSchema = new mongoose.Schema({
  type:           { type: String, required: true, enum: ['internship', 'referral', 'hackathon', 'research', 'club'] },
  postedBy:       { type: String, required: true, index: true }, // email ref
  title:          { type: String, required: true, trim: true, maxlength: 200 },
  description:    { type: String, trim: true, maxlength: 3000, default: '' },
  skillsRequired: { type: [String], default: [] },
  deadline:       { type: Date, index: true },
  applicationUrl: { type: String, default: '' },
  applicants:     { type: [String], default: [] }, // emails
  isVerified:     { type: Boolean, default: false },
}, { timestamps: true });
oppsSchema.index({ title: 'text', description: 'text' });
module.exports = mongoose.model('Opportunity', oppsSchema);
