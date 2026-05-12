const mongoose = require('mongoose');

const StudyGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  year: { type: Number, required: true, min: 1, max: 4 },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxMembers: { type: Number, default: 30 },
  isPrivate: { type: Boolean, default: false },
  joinCode: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: '🎓' }, // Emoji or color
  pinnedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  tags: [String],
  category: {
    type: String,
    enum: ['study', 'project', 'hackathon', 'research', 'general'],
    default: 'study'
  }
}, { timestamps: true });

// Ensure admin is in members
StudyGroupSchema.pre('save', async function() {
  if (this.admin && !this.members.includes(this.admin)) {
    this.members.push(this.admin);
  }
});

module.exports = mongoose.model('Group', StudyGroupSchema);
