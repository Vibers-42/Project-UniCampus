/**
 * @file notifications.model.js — Notifications Schema
 *
 * SINGLE RESPONSIBILITY:
 *   Stores in-app notifications delivered to users (event reminders,
 *   teammate applications, marketplace interest, system alerts).
 *
 * MIGRATION NOTE (2026-05-11):
 *   - `userId` (String/email) DEPRECATED → replaced by `recipient` (ObjectId ref)
 *   - `message` field preserved for backward compat, but `title` + `body` added
 *     to support richer notification payloads
 *   - `type` now uses enum validation
 *   - `relatedEntity` added for deep-linking to source
 *
 * INDEXES:
 *   - recipient + isRead + createdAt (compound) — primary query: unread for user
 *   - recipient + createdAt (desc) — all notifications sorted by time
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // ADDED: ObjectId ref to User — replaces email-based userId
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // DEPRECATED: kept for backward compatibility with any existing documents.
    // New code should use `recipient` (ObjectId) instead.
    userId: {
      type: String,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: {
        values: [
          'teammate_apply',
          'marketplace_interest',
          'event_reminder',
          'group_invite',
          'resource_uploaded',
          'message',
          'system',
        ],
        message: 'Invalid notification type',
      },
    },

    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: '',
    },

    body: {
      type: String,
      trim: true,
      maxlength: [500, 'Body cannot exceed 500 characters'],
      default: '',
    },

    // DEPRECATED: kept for backward compat. New code should use `title` + `body`.
    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    // ADDED: deep-link back to the source entity
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['event', 'teammate', 'marketplace', 'resource', 'group', 'message', 'user'],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },

    // Preserved for backward compat — flexible payload
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Primary query: unread notifications for a user, newest first
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
// All notifications for a user, newest first
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
