const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String },
  attachmentUrl: { type: String },
  attachmentType: { type: String, enum: ['pdf', 'image', 'doc', 'none'], default: 'none' },
  attachmentName: { type: String },
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupThread', default: null },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('GroupChat', GroupMessageSchema);
