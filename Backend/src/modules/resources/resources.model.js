/** @file resources.model.js — Academic Resources Schema (scaffold) */
const mongoose = require('mongoose');
const resourcesSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true, maxlength: 200 },
  uploadedBy:    { type: String, required: true, index: true }, // email ref
  department:    { type: String, required: true, index: true },
  semester:      { type: Number, min: 1, max: 8 },
  subject:       { type: String, trim: true, default: '' },
  pdfUrl:        { type: String, required: true }, // Cloudinary URL
  fileSize:      { type: Number, default: 0 }, // bytes
  upvotes:       { type: [String], default: [] }, // array of emails
  tags:          { type: [String], default: [] },
  downloadCount: { type: Number, default: 0 },
  examPeriod:    { type: Boolean, default: false },
}, { timestamps: true });
resourcesSchema.index({ title: 'text', tags: 'text', subject: 'text' });
module.exports = mongoose.model('Resource', resourcesSchema);
