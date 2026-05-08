/**
 * @file resources.model.js — Academic Resources Schema
 *
 * SINGLE RESPONSIBILITY:
 *   Defines the Mongoose schema for academic resources (notes, PDFs,
 *   past papers, etc.) shared by students.
 *
 * SCOPE:
 *   Internal to resources/ — only resources.service.js imports this.
 *
 * BINARY DATA:
 *   pdfUrl stores a Cloudinary URL string — NEVER a Buffer.
 *   Frontend uploads directly to Cloudinary; backend stores only the URL.
 *
 * INDEXES:
 *   - uploadedBy: find resources by uploader
 *   - department: filter by department
 *   - tags: filter by tag (array index)
 *   - text index on title + tags + subject: full-text search
 */

const mongoose = require('mongoose');

const resourcesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },

    uploadedBy: {
      type: String,
      required: [true, 'Uploader email is required'],
      index: true, // Find resources by uploader
    },

    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true, // Filter by department
    },

    semester: {
      type: Number,
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8'],
    },

    subject: {
      type: String,
      trim: true,
      default: '',
    },

    pdfUrl: {
      type: String,
      required: [true, 'PDF URL is required'],
    },

    fileSize: {
      type: Number,
      default: 0, // Bytes — set by frontend after Cloudinary upload
    },

    upvotes: {
      type: [String], // Array of email strings (who upvoted)
      default: [],
    },

    tags: {
      type: [String], // e.g. ['midterm', 'notes', 'cheatsheet']
      default: [],
      index: true, // Tag-based filtering
    },

    downloadCount: {
      type: Number,
      default: 0,
    },

    resourceType: {
      type: String,
      enum: {
        values: ['notes', 'past-paper', 'assignment', 'syllabus', 'other'],
        message: 'Resource type must be notes, past-paper, assignment, syllabus, or other',
      },
      default: 'notes',
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search across title, tags, and subject
resourcesSchema.index({ title: 'text', tags: 'text', subject: 'text' });

// Virtual: upvote count (avoids storing a separate counter)
resourcesSchema.virtual('upvoteCount').get(function () {
  return this.upvotes.length;
});

// Ensure virtuals are included in JSON output
resourcesSchema.set('toJSON', { virtuals: true });
resourcesSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Resource', resourcesSchema);
