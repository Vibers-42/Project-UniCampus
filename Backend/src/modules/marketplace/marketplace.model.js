/** @file marketplace.model.js — Marketplace Listings Schema (scaffold) */
const mongoose = require('mongoose');
const listingSchema = new mongoose.Schema({
  seller:     { type: String, required: true, index: true }, // email ref
  title:      { type: String, required: true, trim: true, maxlength: 200 },
  description:{ type: String, trim: true, maxlength: 2000, default: '' },
  price:      { type: Number, required: true, min: 0 },
  imageUrls:  { type: [String], default: [], validate: [v => v.length <= 3, 'Max 3 images'] },
  category:   { type: String, trim: true, default: 'other' },
  status:     { type: String, enum: ['available', 'sold'], default: 'available', index: true },
  buyerEmail: { type: String, default: '' },
}, { timestamps: true });
listingSchema.index({ title: 'text', description: 'text' });
module.exports = mongoose.model('Listing', listingSchema);
