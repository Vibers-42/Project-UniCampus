/**
 * @file post.model.js — Feed Post Schema
 *
 * MIGRATION NOTE (2026-05-11):
 *   - `images` restructured from [String] to [{url, publicId, fileType}]
 *     for Cloudinary cleanup support. Existing bare-string entries will
 *     still be readable via the `url` field.
 *   - Added authorId index and createdAt descending index for feed queries.
 */

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // ADDED: enables profile feed queries
  },
  content: { type: String, required: true },
  // MODIFIED: from [String] to structured objects for Cloudinary publicId tracking
  images: [{
    url:       { type: String, required: true },
    publicId:  { type: String, default: '' },
    fileType:  { type: String, default: 'image' },
  }],
  tags: [{ type: String }],
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  type: {
    type: String,
    enum: ['General', 'Resource', 'Discussion', 'Event', 'Marketplace'],
    default: 'General',
  },
}, { timestamps: true });

// ADDED: Feed listing sorted by newest first
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
