/**
 * @file auth.model.js — User Authentication Schema
 *
 * SINGLE RESPONSIBILITY:
 *   Defines the Mongoose schema for user authentication data.
 *   This model stores ONLY auth-related fields — profile data lives
 *   in the users module (Part 4).
 *
 * SCOPE:
 *   Internal to auth/ — only auth.service.js imports this model.
 *   No other module should ever require this file directly.
 *   Other modules that need user data use the users module instead.
 *
 * STRATEGY:
 *   Currently OTP-based (passwordless). The schema is designed so that
 *   a `password` field can be added later without breaking any module
 *   outside of auth/. Just add the field, update auth.service.js,
 *   and everything else continues working.
 *
 * SECURITY:
 *   - otp: stored as bcrypt hash, select: false (never returned in queries)
 *   - otpExpiry: select: false
 *   - refreshToken: stored as SHA-256 hash, select: false
 *   Fields with select: false must be explicitly requested:
 *     AuthModel.findOne({ email }).select('+otp +otpExpiry')
 */

const mongoose = require('mongoose');

const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: {
        values: ['student', 'clubAdmin', 'admin'],
        message: 'Role must be student, clubAdmin, or admin',
      },
      default: 'student',
    },

    // ── OTP fields (select: false — never returned unless explicitly requested) ──

    otp: {
      type: String, // bcrypt hash of the 6-digit OTP
      select: false,
    },

    otpExpiry: {
      type: Date, // When the OTP expires
      select: false,
    },

    // ── Refresh token (select: false — never returned unless explicitly requested) ──

    refreshToken: {
      type: String, // SHA-256 hash of the refresh token JWT
      select: false,
    },

    lastLogin: {
      type: Date,
    },

    // FUTURE: password field can be added here without breaking any external module.
    // password: { type: String, select: false },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const AuthModel = mongoose.model('User', authSchema);

module.exports = AuthModel;
