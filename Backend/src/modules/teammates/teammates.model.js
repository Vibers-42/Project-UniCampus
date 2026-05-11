/**
 * @file teammates.model.js — TeamProject Schema
 */

const mongoose = require('mongoose');

const teamProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    detailedDescription: {
      type: String,
      required: [true, 'Detailed description is required'],
      trim: true,
      maxlength: [5000, 'Detailed description cannot exceed 5000 characters']
    },
    problemStatement: {
      type: String,
      required: [true, 'Problem statement is required'],
      trim: true,
      maxlength: [2000, 'Problem statement cannot exceed 2000 characters']
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['hackathon', 'project', 'startup', 'competition', 'open source', 'research', 'freelance', 'college project', 'other'],
      default: 'project'
    },
    techStack: [{
      type: String,
      trim: true
    }],
    requiredRoles: [{
      type: String,
      trim: true
    }],
    requiredSkills: [{
      type: String,
      trim: true
    }],
    currentTeamSize: {
      type: Number,
      default: 1,
      min: [1, 'Current team size must be at least 1']
    },
    requiredTeamSize: {
      type: Number,
      required: [true, 'Required total team size is required'],
      min: [2, 'Total required team size must be at least 2']
    },
    contactInfo: {
      type: String,
      required: [true, 'Contact information is required'],
      trim: true,
      maxlength: [200, 'Contact info cannot exceed 200 characters']
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required']
    },
    // MODIFIED: from [String] to structured objects for Cloudinary publicId tracking
    attachments: [{
      url:       { type: String, required: true },
      publicId:  { type: String, default: '' },
      fileType:  { type: String, default: '' },
    }],
    githubLink: {
      type: String,
      trim: true,
      default: ''
    },
    figmaLink: {
      type: String,
      trim: true,
      default: ''
    },
    referenceLinks: [{
      type: String,
      trim: true
    }],
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    },
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster filtering and sorting
teamProjectSchema.index({ status: 1, createdAt: -1 });
teamProjectSchema.index({ category: 1 });
teamProjectSchema.index({ creatorId: 1 });

module.exports = mongoose.model('TeamProject', teamProjectSchema);
