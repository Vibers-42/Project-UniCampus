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
 * IDENTITY CONTRACT:
 *   This model is the global identity source for all modules.
 *   Other modules reference users by `email` (string), never by ObjectId.
 *   This ensures any module can be removed or replaced independently.
 *
 * SCOPE:
 *   Internal to users/ — only users.service.js imports this.
 *
 * BINARY DATA:
 *   avatarUrl stores a Cloudinary URL string — NEVER a Buffer.
 *   Frontend uploads directly to Cloudinary; backend stores only the URL.
 *
 * INDEXES:
 *   - email: unique lookup + auth-profile linking
 *   - department: filter by department
 *   - skills: skill-based search and teammate matching
 *   - text index on name + skills + department: full-text search
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
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      default: '',
    },

    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
      default: '',
      index: true,
    },

    academicYear: {
      type: Number,
      min: [1, 'Academic year must be at least 1'],
      max: [4, 'Academic year cannot exceed 4'],
    },

    semester: {
      type: Number,
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8'],
    },

    skills: {
      type: [String], // e.g. ['react', 'node', 'python']
      default: [],
      index: true, // Teammate matching + skill search
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },

    avatarUrl: {
      type: String, // Cloudinary URL — never binary
      default: '',
    },

    // ── Social Links ──
    // All optional. Frontend validates URL format before submission.

    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },

    linkedinUrl: {
      type: String,
      trim: true,
      default: '',
    },

    portfolioUrl: {
      type: String,
      trim: true,
      default: '',
    },

    college: {
      type: String,
      trim: true,
      maxlength: [200, 'College name cannot exceed 200 characters'],
      default: '',
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search across name, skills, and department
usersSchema.index({ name: 'text', skills: 'text', department: 'text' });

const UsersModel = mongoose.model('Profile', usersSchema);

module.exports = UsersModel;
