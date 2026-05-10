/**
 * @file eventRegistration.model.js — Event Registration Schema
 *
 * SINGLE RESPONSIBILITY:
 *   Tracks user registrations and interests for campus events.
 *
 * SCOPE:
 *   Internal to events/ — only events.service.js imports this.
 */

const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['interested', 'registered', 'attending'],
        message: 'Status must be interested, registered, or attending',
      },
      default: 'interested',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registrations
eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
