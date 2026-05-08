/** @file events.model.js — Campus Events Schema (scaffold) */
const mongoose = require('mongoose');
const eventsSchema = new mongoose.Schema({
  title:            { type: String, required: true, trim: true, maxlength: 200 },
  organiser:        { type: String, required: true, index: true }, // email ref
  description:      { type: String, trim: true, maxlength: 2000, default: '' },
  venue:            { type: String, trim: true, default: '' },
  date:             { type: Date, required: true, index: true },
  registrationLink: { type: String, default: '' },
  bannerUrl:        { type: String, default: '' }, // Cloudinary URL
  rsvpList:         { type: [String], default: [] }, // emails
  teamSize:         { type: Number, default: 1 },
  attendanceQR:     { type: String, default: '' },
  isModerated:      { type: Boolean, default: false },
}, { timestamps: true });
eventsSchema.index({ title: 'text', description: 'text' });
module.exports = mongoose.model('Event', eventsSchema);
