/**
 * @file users.model.js — Unified User Model
 *
 * SINGLE RESPONSIBILITY:
 *   THE ONLY user-related model in the entire application.
 *   Stores everything about a user: identity, auth mapping, profile,
 *   onboarding state, and future-ready platform fields.
 *
 * WHY ONE MODEL:
 *   Firebase handles ALL authentication concerns (credentials, verification,
 *   password reset, session lifecycle). The backend stores zero passwords,
 *   zero OTPs, zero refresh tokens. One unified model is simpler, faster
 *   to query, and eliminates cross-collection sync issues.
 *
 * IDENTITY FIELDS:
 *   firebaseUid  — Maps to Firebase Auth. Used ONLY by auth middleware and
 *                  users.service.js for authentication lookups. No business
 *                  module should ever reference this field.
 *   email        — Human-readable identity. Used as the cross-module link.
 *                  All business modules reference users by email.
 *   _id          — MongoDB ObjectId. Used for internal relationships
 *                  (e.g., event.createdBy, resource.uploadedBy).
 *
 * SCOPE:
 *   Internal to users/ — only users.service.js imports this model.
 *   Auth module accesses user data through users.service.js (public interface).
 *   Admin module is the only documented exception (cross-module model access).
 *
 * INDEXES:
 *   - firebaseUid: unique, optimized for auth middleware lookups (every request)
 *   - email: unique, cross-module identity lookups
 *   - rollNumber: unique (sparse — null allowed for new users pre-onboarding)
 *   - department: filter by department
 *   - skills: skill-based search and teammate matching
 *   - text index on fullName + skills + department: full-text search
 */

const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema(
  {
    // ══════════════════════════════════════════
    // FIREBASE IDENTITY (auth mapping only)
    // ══════════════════════════════════════════
    // Used ONLY by auth middleware + users.service.js.
    // Business modules NEVER reference this field.
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      index: true,
    },

    // ══════════════════════════════════════════
    // CORE IDENTITY
    // ══════════════════════════════════════════

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    fullName: {
      type: String,
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
      default: '',
    },

    rollNumber: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true, // Allows multiple null values (pre-onboarding users)
      unique: true,
      index: true,
    },

    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
      default: '',
      index: true,
    },

    yearOfStudy: {
      type: Number,
      min: [1, 'Year of study must be at least 1'],
      max: [4, 'Year of study cannot exceed 4'],
    },

    // ══════════════════════════════════════════
    // SYSTEM FIELDS
    // ══════════════════════════════════════════

    role: {
      type: String,
      enum: {
        values: ['student', 'clubAdmin', 'admin', 'organizer', 'coordinator', 'club_lead'],
        message: 'Role must be student, clubAdmin, admin, organizer, coordinator, or club_lead',
      },
      default: 'student',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ══════════════════════════════════════════
    // OPTIONAL PROFILE FIELDS
    // ══════════════════════════════════════════

    avatar: {
      type: String, // Cloudinary URL — never binary
      default: '',
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },

    skills: {
      type: [String], // e.g. ['react', 'node', 'python']
      default: [],
      index: true, // Teammate matching + skill search
    },

    interests: {
      type: [String], // e.g. ['web development', 'machine learning', 'design']
      default: [],
    },

    techStack: {
      type: [String], // e.g. ['MERN', 'Flutter', 'Django']
      default: [],
    },

    rolesPreferred: {
      type: [String], // e.g. ['frontend', 'backend', 'fullstack', 'design', 'PM']
      default: [],
    },

    availability: {
      type: String,
      enum: {
        values: ['available', 'busy', 'looking-for-team', 'not-available', ''],
        message: 'Availability must be available, busy, looking-for-team, or not-available',
      },
      default: '',
    },

    github: {
      type: String,
      trim: true,
      default: '',
    },

    linkedin: {
      type: String,
      trim: true,
      default: '',
    },

    portfolio: {
      type: String,
      trim: true,
      default: '',
    },

    // ══════════════════════════════════════════
    // ONBOARDING FIELDS
    // ══════════════════════════════════════════

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    onboardingSkipped: {
      type: Boolean,
      default: false,
    },

    // ══════════════════════════════════════════
    // FUTURE-READY STUBS
    // ══════════════════════════════════════════
    // These fields cost zero storage when empty. Adding them now
    // prevents future schema migrations and lets UI placeholder
    // components render immediately.

    reputationScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    badges: {
      type: [String], // e.g. ['early-adopter', 'top-contributor', 'hackathon-winner']
      default: [],
    },

    profileCompletionPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ══════════════════════════════════════════
    // METADATA
    // ══════════════════════════════════════════

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Full-text search across fullName, skills, and department
usersSchema.index({ fullName: 'text', skills: 'text', department: 'text' });

const User = mongoose.model('User', usersSchema);

module.exports = User;
