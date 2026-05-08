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
 *   - organiser: find events by creator
 *   - date: sort/filter upcoming vs past events
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

    organiser: {
      type: String,
      required: [true, 'Organiser email is required'],
      index: true, // Find events by organiser
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

    date: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true, // Sort upcoming/past
    },

    endDate: {
      type: Date, // Optional — for multi-day events
    },

    category: {
      type: String,
      enum: {
        values: ['workshop', 'hackathon', 'seminar', 'cultural', 'sports', 'meetup', 'other'],
        message: 'Category must be workshop, hackathon, seminar, cultural, sports, meetup, or other',
      },
      default: 'other',
      index: true, // Filter by category
    },

    registrationLink: {
      type: String,
      default: '',
    },

    bannerUrl: {
      type: String,
      default: '', // Cloudinary URL — never binary
    },

    rsvpList: {
      type: [String], // Array of email strings (who RSVPed)
      default: [],
    },

    maxCapacity: {
      type: Number,
      default: 0, // 0 = unlimited
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

// Virtual: RSVP count
eventsSchema.virtual('rsvpCount').get(function () {
  return this.rsvpList.length;
});

// Virtual: is event in the past?
eventsSchema.virtual('isPast').get(function () {
  return this.date < new Date();
});

// Ensure virtuals are included in JSON output
eventsSchema.set('toJSON', { virtuals: true });
eventsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventsSchema);
