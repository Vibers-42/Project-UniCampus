/**
 * @file events.model.js — Campus Events Schema
 *
 * SINGLE RESPONSIBILITY:
 *   Defines the Mongoose schema for campus events (workshops, hackathons,
 *   meetups, cultural events, etc.) organized by students or clubs.
 *
 * SCOPE:
 *   Internal to events/ — only events.service.js imports this.
 *
 * BINARY DATA:
 *   bannerUrl stores a Cloudinary URL string — NEVER a Buffer.
 *
 * INDEXES:
 *   - organizerId: find events by creator
 *   - startDate: sort/filter upcoming vs past events
 *   - category: filter by event type
 *   - text index on title + description: full-text search
 */

const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer ID is required'],
      index: true,
    },

    campusId: {
      type: String,
      trim: true,
      default: 'main', // Default to main campus for MVP
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },

    venue: {
      type: String,
      trim: true,
      maxlength: [200, 'Venue cannot exceed 200 characters'],
      default: '',
    },

    startDate: {
      type: Date,
      required: [true, 'Event start date is required'],
      index: true,
    },

    endDate: {
      type: Date, // Optional — for multi-day events
    },

    registrationDeadline: {
      type: Date,
    },

    category: {
      type: String,
      enum: {
        values: ['workshop', 'hackathon', 'seminar', 'cultural', 'sports', 'meetup', 'club', 'other'],
        message: 'Invalid category',
      },
      default: 'other',
      index: true,
    },

    registrationLink: {
      type: String, // External link if needed
      default: '',
    },

    bannerUrl: {
      type: String,
      default: '', // Cloudinary URL
    },

    maxParticipants: {
      type: Number,
      default: 0, // 0 = unlimited
    },

    interestedCount: {
      type: Number,
      default: 0,
    },

    registeredCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: {
        values: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        message: 'Status must be upcoming, ongoing, completed, or cancelled',
      },
      default: 'upcoming',
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    isModerated: {
      type: Boolean,
      default: false, // Admin-approved event
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search across title and description
eventsSchema.index({ title: 'text', description: 'text' });

// Virtual: is event in the past?
eventsSchema.virtual('isPast').get(function () {
  return this.startDate < new Date();
});

// Ensure virtuals are included in JSON output
eventsSchema.set('toJSON', { virtuals: true });
eventsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventsSchema);
