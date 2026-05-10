/**
 * @file resources.model.js — Academic Resources Schema
 *
 * SINGLE RESPONSIBILITY:
 *   Defines the Mongoose schema for academic resources (notes, PDFs,
 *   past papers, lab manuals, etc.) shared by students.
 *
 * FIELDS:
 *   title, description, fileUrl, fileType, publicId (Cloudinary),
 *   subject, department, year, semester, category, uploadedBy (ref: User),
 *   tags[], upvotes[] (ref: User), qualityRating, ratingCount, ratedBy[],
 *   downloadCount, isExamPeriod, fileHash (for duplicate detection), createdAt
 *
 * INDEXES:
 *   - Text index on title + description + tags + subject: full-text search
 *   - department + semester: compound filter index
 *   - fileHash + department + semester: duplicate detection
 */

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
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

    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },

    fileType: {
      type: String,
      enum: {
        values: ['pdf', 'doc', 'image'],
        message: 'File type must be pdf, doc, or image',
      },
      required: [true, 'File type is required'],
    },

    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },

    subject: {
      type: String,
      trim: true,
      default: '',
    },

    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },

    year: {
      type: Number,
      min: [1, 'Year must be at least 1'],
      max: [4, 'Year cannot exceed 4'],
    },

    semester: {
      type: Number,
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8'],
    },

    category: {
      type: String,
      enum: {
        values: ['notes', 'pyq', 'lab-manual', 'assignment', 'reference', 'other'],
        message: 'Category must be notes, pyq, lab-manual, assignment, reference, or other',
      },
      default: 'notes',
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    upvotes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },

    qualityRating: {
      type: Number,
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
    },

    ratedBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },

    downloadCount: {
      type: Number,
      default: 0,
    },

    isExamPeriod: {
      type: Boolean,
      default: false,
    },

    fileHash: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search across title, description, tags, and subject
resourceSchema.index({ title: 'text', description: 'text', tags: 'text', subject: 'text' });

// Filter index
resourceSchema.index({ department: 1, semester: 1 });

// Duplicate detection index
resourceSchema.index({ fileHash: 1, department: 1, semester: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
