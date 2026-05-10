/**
 * @file resourceIndex.model.js — Subject Autocomplete Index
 *
 * SINGLE RESPONSIBILITY:
 *   Tracks which subjects exist per department+semester combination.
 *   Used by GET /resources/subjects for autocomplete suggestions.
 *
 * COMPOUND UNIQUE INDEX:
 *   { department, semester } — ensures one document per dept+semester combo.
 *   Subjects are pushed via $addToSet to prevent duplicates.
 */

const mongoose = require('mongoose');

const resourceIndexSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },

    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },

    subjects: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — one document per department+semester
resourceIndexSchema.index({ department: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('ResourceIndex', resourceIndexSchema);
