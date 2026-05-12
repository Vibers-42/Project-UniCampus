const catchAsync = require('../middleware/catchAsync');
const { sendSuccess } = require('../shared/responses/apiResponse');
const AppError = require('../shared/utils/AppError');
const Group = require('../models/StudyGroup');
const GroupChat = require('../models/GroupMessage');
const GroupThread = require('../models/GroupThread');
const { sendInAppNotification } = require('../shared/notificationService');
const { uploadFile } = require('../shared/uploadService');
const crypto = require('crypto');

/**
 * Generate 6-char alphanumeric join code
 */
const generateJoinCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

// ── GROUPS ───────────────────────────────────────────────────────────────────

exports.getGroups = catchAsync(async (req, res) => {
  const { search, subject, department, semester, year, category, tab } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  if (subject) query.subject = subject;
  if (department) query.department = department;
  if (semester) query.semester = parseInt(semester);
  if (year) query.year = parseInt(year);
  if (category && category !== 'all') query.category = category;

  if (tab === 'my-groups') {
    query.admin = req.user.id;
  } else if (tab === 'joined') {
    query.members = req.user.id;
  }

  const groups = await Group.find(query)
    .populate('admin', 'fullName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Group.countDocuments(query);

  sendSuccess(res, {
    items: groups,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }, 'Groups fetched successfully');
});

exports.createGroup = catchAsync(async (req, res) => {
  const { name, description, subject, department, semester, year, maxMembers, isPrivate, avatar, tags, category } = req.body;

  const groupData = {
    name,
    description,
    subject,
    department,
    semester,
    year,
    admin: req.user.id,
    members: [req.user.id],
    maxMembers,
    isPrivate,
    avatar,
    tags,
    category
  };

  if (isPrivate) {
    groupData.joinCode = generateJoinCode();
  }

  const group = await Group.create(groupData);
  
  // 360 Integration: Future Feed Post logic could go here
  
  sendSuccess(res, group, 'Study group created successfully', 201);
});

exports.getGroupById = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('admin', 'fullName avatar email')
    .populate('members', 'fullName avatar department yearOfStudy')
    .populate('pinnedResources');

  if (!group) throw new AppError('Group not found', 404);

  // Check membership
  if (!group.members.some(m => m._id.toString() === req.user.id.toString())) {
    throw new AppError('You are not a member of this group', 403);
  }

  const threads = await GroupThread.find({ group: group._id }).sort({ isPinned: -1, lastActivity: -1 });

  sendSuccess(res, { group, threads }, 'Group details fetched');
});

exports.joinGroup = catchAsync(async (req, res) => {
  const { joinCode } = req.body || {};
  const group = await Group.findById(req.params.id);

  if (!group) throw new AppError('Group not found', 404);

  if (group.members.includes(req.user.id)) {
    throw new AppError('Already a member', 400);
  }

  if (group.members.length >= group.maxMembers) {
    throw new AppError('Group is full', 400);
  }

  if (group.isPrivate) {
    if (joinCode !== group.joinCode) {
      throw new AppError('Invalid join code', 403);
    }
  }

  group.members.push(req.user.id);
  await group.save();

  // Notify Admin
  await sendInAppNotification(
    group.admin,
    'group_member_joined',
    `${req.user.fullName} joined your group ${group.name}`,
    { groupId: group._id }
  );

  // Socket logic handled in routes/controller if io is available or emitted here
  const io = req.app.get('io');
  if (io) {
    io.to(`group:${group._id}`).emit('memberJoined', {
      user: { _id: req.user.id, name: req.user.fullName, avatar: req.user.avatar }
    });
  }

  sendSuccess(res, group, 'Joined group successfully');
});

exports.leaveGroup = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) throw new AppError('Group not found', 404);

  if (!group.members.includes(req.user.id)) {
    throw new AppError('Not a member', 400);
  }

  group.members = group.members.filter(m => m.toString() !== req.user.id.toString());

  if (group.members.length === 0) {
    await Group.findByIdAndDelete(group._id);
    await GroupChat.deleteMany({ group: group._id });
    await GroupThread.deleteMany({ group: group._id });
    return sendSuccess(res, null, 'Group deleted as it had no members');
  }

  // Admin transfer
  if (group.admin.toString() === req.user.id.toString()) {
    group.admin = group.members[0];
  }

  await group.save();

  const io = req.app.get('io');
  if (io) {
    io.to(`group:${group._id}`).emit('memberLeft', { userId: req.user.id });
  }

  sendSuccess(res, null, 'Left group successfully');
});

exports.deleteGroup = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) throw new AppError('Group not found', 404);

  if (group.admin.toString() !== req.user.id.toString()) {
    throw new AppError('Only admin can delete group', 403);
  }

  await Group.findByIdAndDelete(group._id);
  await GroupChat.deleteMany({ group: group._id });
  await GroupThread.deleteMany({ group: group._id });

  sendSuccess(res, null, 'Group and all data deleted');
});

exports.updateGroup = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) throw new AppError('Group not found', 404);

  if (group.admin.toString() !== req.user.id.toString()) {
    throw new AppError('Only admin can update group', 403);
  }

  const updates = req.body;
  const allowed = ['name', 'description', 'maxMembers', 'isPrivate', 'tags', 'category', 'avatar'];
  
  allowed.forEach(key => {
    if (updates[key] !== undefined) group[key] = updates[key];
  });

  await group.save();
  sendSuccess(res, group, 'Group updated');
});

exports.pinResource = catchAsync(async (req, res) => {
  const { resourceId } = req.body;
  const group = await Group.findById(req.params.id);
  
  if (group.admin.toString() !== req.user.id.toString()) {
    throw new AppError('Admin only', 403);
  }

  if (group.pinnedResources.length >= 10) {
    throw new AppError('Max 10 pinned resources allowed', 400);
  }

  if (!group.pinnedResources.includes(resourceId)) {
    group.pinnedResources.push(resourceId);
    await group.save();
    
    // Notify all members
    const io = req.app.get('io');
    if (io) {
      io.to(`group:${group._id}`).emit('resourcePinned', { resourceId });
    }
  }

  sendSuccess(res, group, 'Resource pinned');
});

exports.unpinResource = catchAsync(async (req, res) => {
  const { resourceId } = req.params;
  const group = await Group.findById(req.params.id);

  if (group.admin.toString() !== req.user.id.toString()) {
    throw new AppError('Admin only', 403);
  }

  group.pinnedResources = group.pinnedResources.filter(id => id.toString() !== resourceId);
  await group.save();

  sendSuccess(res, group, 'Resource unpinned');
});

// ── MEMBERS ──────────────────────────────────────────────────────────────────

exports.getMembers = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id).populate('members', 'fullName avatar department yearOfStudy email');
  if (!group) throw new AppError('Group not found', 404);

  const members = group.members.map(m => ({
    ...m.toObject(),
    role: m._id.toString() === group.admin.toString() ? 'admin' : 'member'
  }));

  sendSuccess(res, members, 'Members fetched');
});

exports.kickMember = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const group = await Group.findById(req.params.id);

  if (group.admin.toString() !== req.user.id.toString()) {
    throw new AppError('Admin only', 403);
  }

  if (userId === group.admin.toString()) {
    throw new AppError('Cannot kick admin', 400);
  }

  group.members = group.members.filter(m => m.toString() !== userId);
  await group.save();

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${userId}`).emit('kickedFromGroup', { groupId: group._id });
    io.to(`group:${group._id}`).emit('memberLeft', { userId });
  }

  sendSuccess(res, null, 'Member kicked');
});

// ── THREADS ──────────────────────────────────────────────────────────────────

exports.getThreads = catchAsync(async (req, res) => {
  const threads = await GroupThread.find({ group: req.params.id })
    .populate('createdBy', 'fullName avatar')
    .sort({ isPinned: -1, lastActivity: -1 });

  sendSuccess(res, threads, 'Threads fetched');
});

exports.createThread = catchAsync(async (req, res) => {
  const { title, topic } = req.body;
  const group = await Group.findById(req.params.id);

  if (!group.members.includes(req.user.id)) throw new AppError('Not a member', 403);

  const thread = await GroupThread.create({
    group: group._id,
    createdBy: req.user.id,
    title,
    topic
  });

  sendSuccess(res, thread, 'Thread created', 201);
});

exports.togglePinThread = catchAsync(async (req, res) => {
  const thread = await GroupThread.findById(req.params.threadId);
  const group = await Group.findById(req.params.id);

  if (group.admin.toString() !== req.user.id.toString()) throw new AppError('Admin only', 403);

  thread.isPinned = !thread.isPinned;
  await thread.save();

  sendSuccess(res, thread, thread.isPinned ? 'Thread pinned' : 'Thread unpinned');
});

exports.deleteThread = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (group.admin.toString() !== req.user.id.toString()) throw new AppError('Admin only', 403);

  await GroupThread.findByIdAndDelete(req.params.threadId);
  await GroupChat.deleteMany({ threadId: req.params.threadId });

  sendSuccess(res, null, 'Thread and its messages deleted');
});

// ── MESSAGES ─────────────────────────────────────────────────────────────────

exports.getMessages = catchAsync(async (req, res) => {
  const { threadId } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;

  const query = { group: req.params.id, threadId: threadId || null };

  const messages = await GroupChat.find(query)
    .populate('sender', 'fullName avatar')
    .sort({ createdAt: -1 }) // Get latest first for pagination logic
    .skip(skip)
    .limit(limit);

  // Return in chronological order
  const chronological = messages.reverse();

  sendSuccess(res, chronological, 'Messages fetched');
});

exports.sendMessage = catchAsync(async (req, res) => {
  const { body, threadId } = req.body;
  const group = await Group.findById(req.params.id);

  if (!group.members.includes(req.user.id)) throw new AppError('Not a member', 403);

  const msgData = {
    group: group._id,
    sender: req.user.id,
    body,
    threadId: threadId || null
  };

  // Handle Attachment if file was uploaded via Multer
  if (req.file) {
    const folder = `groups/${group._id}`;
    const resourceType = req.file.mimetype.startsWith('image') ? 'image' : 'raw';
    const result = await uploadFile(req.file.buffer, folder, resourceType);
    
    msgData.attachmentUrl = result.secure_url;
    msgData.attachmentName = req.file.originalname;
    msgData.attachmentType = req.file.mimetype.startsWith('image') ? 'image' : 
                            req.file.mimetype === 'application/pdf' ? 'pdf' : 'doc';
  }

  const message = await GroupChat.create(msgData);
  const populated = await GroupChat.findById(message._id).populate('sender', 'fullName avatar');

  // Socket emit
  const io = req.app.get('io');
  if (io) {
    const room = threadId ? `thread:${threadId}` : `group:${group._id}`;
    io.to(room).emit('newMessage', populated);
  }

  // Thread activity
  if (threadId) {
    await GroupThread.findByIdAndUpdate(threadId, {
      $inc: { messageCount: 1 },
      lastActivity: Date.now()
    });
  }

  sendSuccess(res, populated, 'Message sent', 201);
});

exports.deleteMessage = catchAsync(async (req, res) => {
  const message = await GroupChat.findById(req.params.messageId);
  if (!message) throw new AppError('Message not found', 404);

  const group = await Group.findById(req.params.id);
  const isSender = message.sender.toString() === req.user.id.toString();
  const isAdmin = group.admin.toString() === req.user.id.toString();

  if (!isSender && !isAdmin) throw new AppError('Unauthorized', 403);

  message.isDeleted = true;
  message.body = null;
  message.attachmentUrl = null;
  await message.save();

  const io = req.app.get('io');
  if (io) {
    const room = message.threadId ? `thread:${message.threadId}` : `group:${message.group}`;
    io.to(room).emit('messageDeleted', { messageId: message._id });
  }

  sendSuccess(res, null, 'Message deleted');
});

exports.markRead = catchAsync(async (req, res) => {
  const { messageIds } = req.body;
  await GroupChat.updateMany(
    { _id: { $in: messageIds }, group: req.params.id },
    { $addToSet: { readBy: req.user.id } }
  );
  sendSuccess(res, null, 'Messages marked as read');
});
