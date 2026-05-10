const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  images: [{ type: String }], // Cloudinary URLs
  tags: [{ type: String }],
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  type: { type: String, enum: ['General', 'Resource', 'Discussion', 'Event', 'Marketplace'], default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
