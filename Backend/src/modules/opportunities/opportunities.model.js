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
    attachments: { type: [String], default: [] }, // Cloudinary URLs
    deadline: { type: Date },
    applyLink: { type: String, default: '' },
    tags: { type: [String], default: [] },
    banner: { type: String, default: '' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    campusId: { type: String, trim: true, default: 'main', index: true },
    
    alumniName: { type: String, default: '' },
    role: { type: String, default: '' },
    referralStatus: { type: String, enum: ['Open', 'Closed'], default: 'Open' }
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

module.exports = mongoose.model('Opportunity', opportunitiesSchema);
