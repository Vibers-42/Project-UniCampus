/**
 * @file post.model.js — Feed Post Schema
 *
 * MIGRATION NOTE (2026-05-11):
 *   - `images` restructured from [String] to [{url, publicId, fileType}]
 *     for Cloudinary cleanup support. Existing bare-string entries will
 *     still be readable via the `url` field.
 *   - Added authorId index and createdAt descending index for feed queries.
 *
 * PERSONALIZATION NOTE (2026-05-12):
 *   - Added content-targeting fields (targetDepartment, targetYearOfStudy).
 *     These are CONTENT METADATA describing who this post is relevant to,
 *     NOT duplicated author profile data. Auto-populated from author context
 *     at creation time as a sensible default, but semantically independent.
 *   - Added isActive for content safety filtering.
 *   - Added viewsCount for lightweight engagement tracking.
 *   - Added compound indexes for personalized aggregation pipeline.
 */

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: { type: String, required: true },
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

  // ══════════════════════════════════════════
  // CONTENT TARGETING (personalization signals)
  // ══════════════════════════════════════════
  // WHY: Aggregation pipeline needs post-level fields to score against
  //      the user's profile. Cannot be derived dynamically without an
  //      expensive $lookup on every feed query.
  // WHAT: Describes "who is this post relevant to" — NOT author identity.
  //       Auto-defaulted from author profile at creation time.

  targetDepartment: {
    type: String,
    default: '',
    // INDEX: compound with createdAt for department-filtered feed queries
  },

  targetYearOfStudy: {
    type: Number,
    default: null,
    // INDEX: used in $addFields scoring within aggregation pipeline
  },

  // ══════════════════════════════════════════
  // CONTENT SAFETY
  // ══════════════════════════════════════════

  isActive: {
    type: Boolean,
    default: true,
    // INDEX: compound with createdAt — first $match stage in every feed query
  },

  // ══════════════════════════════════════════
  // ENGAGEMENT TRACKING
  // ══════════════════════════════════════════
  // WHY: Trending boost in relevance scoring. likesCount + commentsCount
  //      already exist. viewsCount adds a passive engagement signal.

  viewsCount: { type: Number, default: 0 },

}, { timestamps: true });

// ══════════════════════════════════════════
// INDEXES — each justified by a query pattern
// ══════════════════════════════════════════

// Primary feed query: active posts sorted by newest
// Used by: $match { isActive: true } + $sort { createdAt: -1 }
postSchema.index({ isActive: 1, createdAt: -1 });

// Type-filtered feed: active posts of a specific type
// Used by: $match { isActive: true, type: 'Resource' }
postSchema.index({ isActive: 1, type: 1, createdAt: -1 });

// Department-targeted feed: narrow candidates by department
// Used by: $match with targetDepartment in personalized path
postSchema.index({ targetDepartment: 1, createdAt: -1 });

// Trending: sort by engagement within a time window
// Used by: trending recommendations query
postSchema.index({ likesCount: -1, commentsCount: -1, createdAt: -1 });

// Tag-based matching: multikey index for $setIntersection prep
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
