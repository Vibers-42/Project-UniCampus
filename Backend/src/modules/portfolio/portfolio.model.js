/**
 * @file portfolio.model.js — Portfolio Schema
 * Single document schema with embedded arrays for optimal read performance.
 */

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  techStack: [{ type: String, trim: true }],
  githubLink: { type: String, trim: true, default: '' },
  liveLink: { type: String, trim: true, default: '' },
  image: { type: String, default: '' }, // Cloudinary URL
  // ADDED: Cloudinary public_id for project image
  imagePublicId: { type: String, default: '' },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'completed' },
});

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  organization: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // null if current
  type: { type: String, enum: ['internship', 'campus_role', 'club_position', 'freelance', 'research', 'other'], default: 'internship' },
  isCurrent: { type: Boolean, default: false }
});

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  issuer: { type: String, trim: true, default: '' },
  date: { type: Date, required: true },
  link: { type: String, trim: true, default: '' }
});

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    // ADDED: Cloudinary public_id for profile image
    profileImagePublicId: {
      type: String,
      default: ''
    },
    socialLinks: {
      linkedin: { type: String, trim: true, default: '' },
      github: { type: String, trim: true, default: '' },
      leetcode: { type: String, trim: true, default: '' },
      codechef: { type: String, trim: true, default: '' },
      hackerrank: { type: String, trim: true, default: '' },
      website: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
    },
    skills: [{
      type: String,
      trim: true
    }],
    techStack: [{
      type: String,
      trim: true
    }],
    tools: [{
      type: String,
      trim: true
    }],
    domains: [{
      type: String,
      trim: true
    }],
    projects: [projectSchema],
    experience: [experienceSchema],
    achievements: [achievementSchema],
    cgpa: {
      type: Number,
      min: 0,
      max: 10
    },
    resumeUrl: {
      type: String,
      default: ''
    },
    // ADDED: Cloudinary public_id for resume
    resumePublicId: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
