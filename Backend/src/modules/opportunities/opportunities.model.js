const mongoose = require('mongoose');

const opportunitiesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    type: { 
      type: String, 
      required: true, 
      enum: ['Internship', 'Placement Drive', 'Club Recruitment', 'Campus Ambassador', 'Alumni Referral', 'Workshop Opportunity', 'Certification Program', 'Hackathon Opportunity', 'Other'] 
    },
    organization: { type: String, required: true, trim: true },
    eligibility: { type: String, trim: true, default: '' },
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

opportunitiesSchema.index({ title: 'text', description: 'text', organization: 'text' });

module.exports = mongoose.model('Opportunity', opportunitiesSchema);
