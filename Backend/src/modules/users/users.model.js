/**
 * @file users.model.js — Student Profile Schema
 *
 * SINGLE RESPONSIBILITY:
 *   Stores student profile/identity data. This is intentionally SEPARATE
 *   from auth.model.js (which stores authentication concerns only).
 *
 * LINKING:
 *   auth.model  → authentication (email, otp, tokens, role)
 *   users.model → profile (name, department, skills, avatar, etc.)
 *   Linked by `email` — not by embedding one inside the other.
 *
 *   This separation means:
 *   - Changing auth strategy doesn't touch profile data
 *   - Profile updates never affect auth state
 *   - Each module owns its own data completely
 *
 * SCOPE:
 *   Internal to users/ — only users.service.js imports this.
 *
 * BINARY DATA:
 *   avatarUrl stores a Cloudinary URL string — NEVER a Buffer.
 *   Frontend uploads directly to Cloudinary; backend stores only the URL.
 */

const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },

    department: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },

    academicYear: {
      type: Number,
      min: 1,
      max: 4,
    },

    semester: {
      type: Number,
      min: 1,
      max: 8,
    },

    skills: {
      type: [String],
      default: [],
      index: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    avatarUrl: {
      type: String, // Cloudinary URL — never binary
      default: '',
    },

    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },

    portfolioUrl: {
      type: String,
      trim: true,
      default: '',
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    college: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
usersSchema.index({ name: 'text', skills: 'text', department: 'text' });

const UsersModel = mongoose.model('Profile', usersSchema);

module.exports = UsersModel;
