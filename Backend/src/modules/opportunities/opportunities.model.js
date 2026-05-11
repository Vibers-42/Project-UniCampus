const mongoose = require('mongoose');

const opportunitiesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    type: { 
      type: String, 
      required: true, 
      enum: [
        'Internship', 'Placement Drive', 'Club Recruitment', 'Campus Ambassador', 
        'Alumni Referral', 'Workshop Opportunity', 'Certification Program', 
        'Hackathon Opportunity', 'Hackathons', 'Workshops', 'Research Opportunities', 
        'Certifications', 'Startup Internships', 'Student Chapters', 'Technical Events', 
        'Volunteer Programs', 'Other'
      ] 
    },
    organization: { type: String, required: true, trim: true },
    eligibility: { type: String, trim: true, default: '' },
    departments: { type: [String], default: [] },
    yearsEligible: { type: [String], default: [] },
    mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'], default: 'Offline' },
    stipend: { type: String, default: '' },
    facultyCoordinator: { type: String, default: '' },
    facultyContact: { type: String, default: '' },
    studentCoordinator: { type: String, default: '' },
    studentContact: { type: String, default: '' },
    responsibilities: { type: String, default: '' },
    requirements: { type: String, default: '' },
    applicationProcess: { type: String, default: '' },
    attachments: [{
      url:       { type: String, required: true },
      publicId:  { type: String, default: '' },
      fileType:  { type: String, default: '' },
    }],
    deadline: { type: Date },
    applyLink: { type: String, default: '' },
    tags: { type: [String], default: [] },
    banner: { type: String, default: '' },
    // ADDED: Cloudinary public_id for banner — needed for cleanup
    bannerPublicId: { type: String, default: '' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    campusId: { type: String, trim: true, default: 'main', index: true },
    
    alumniName: { type: String, default: '' },
    role: { type: String, default: '' },
    referralStatus: { type: String, enum: ['Open', 'Closed'], default: 'Open' },

    // ADDED: Lifecycle status for opportunity tracking
    status: {
      type: String,
      enum: {
        values: ['active', 'expired', 'filled', 'draft'],
        message: 'Status must be active, expired, filled, or draft',
      },
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

opportunitiesSchema.index({ 
  title: 'text', 
  description: 'text', 
  organization: 'text',
  facultyCoordinator: 'text',
  studentCoordinator: 'text'
});

// ADDED: Compound indexes for common filter patterns
opportunitiesSchema.index({ type: 1, deadline: 1 });
opportunitiesSchema.index({ postedBy: 1, createdAt: -1 });

module.exports = mongoose.model('Opportunity', opportunitiesSchema);
