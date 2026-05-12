/** @file studyGroups.service.js */
const { StudyGroup, GroupMessage } = require('./studyGroups.model');
const AppError = require('../../shared/utils/AppError');
const mongoose = require('mongoose');

/**
 * Convert a value to ObjectId safely.
 * Handles both string IDs and existing ObjectId instances.
 */
const toObjectId = (val) => {
  if (val instanceof mongoose.Types.ObjectId) return val;
  return new mongoose.Types.ObjectId(String(val));
};

const create = async (data, userId) => {
  const uid = toObjectId(userId);
  return StudyGroup.create({ ...data, createdBy: uid, members: [uid], memberCount: 1 });
};

const getAll = async (filters = {}) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.search) query.$text = { $search: filters.search };
  return StudyGroup.find(query)
    .populate('createdBy', 'fullName avatar email')
    .populate('members', 'fullName avatar email')
    .sort({ createdAt: -1 })
    .limit(30);
};

const getById = async (id) => {
  const g = await StudyGroup.findById(id)
    .populate('createdBy', 'fullName avatar email')
    .populate('members', 'fullName avatar email');
  if (!g) throw new AppError('Study group not found', 404);
  return g;
};

const join = async (id, userId) => {
  const uid = toObjectId(userId);
  const g = await StudyGroup.findById(id);
  if (!g) throw new AppError('Study group not found', 404);
  if (g.members.some(m => m.toString() === uid.toString())) {
    throw new AppError('Already a member', 400);
  }
  g.members.push(uid);
  g.memberCount += 1;
  await g.save();
  return g.populate([
    { path: 'createdBy', select: 'fullName avatar email' },
    { path: 'members', select: 'fullName avatar email' },
  ]);
};

const leave = async (id, userId) => {
  const uid = toObjectId(userId);
  const g = await StudyGroup.findById(id);
  if (!g) throw new AppError('Study group not found', 404);
  if (!g.members.some(m => m.toString() === uid.toString())) {
    throw new AppError('Not a member', 400);
  }
  g.members = g.members.filter(m => m.toString() !== uid.toString());
  g.memberCount = Math.max(0, g.memberCount - 1);
  await g.save();
  return g.populate([
    { path: 'createdBy', select: 'fullName avatar email' },
    { path: 'members', select: 'fullName avatar email' },
  ]);
};

const sendMessage = async (groupId, userId, content) => {
  const uid = toObjectId(userId);
  const g = await StudyGroup.findById(groupId);
  if (!g) throw new AppError('Study group not found', 404);
  if (!g.members.some(m => m.toString() === uid.toString())) {
    throw new AppError('Must be a member to message', 403);
  }
  const msg = await GroupMessage.create({ groupId, sender: uid, content });
  return msg.populate('sender', 'fullName avatar email');
};

const getMessages = async (groupId) => {
  return GroupMessage.find({ groupId })
    .populate('sender', 'fullName avatar email')
    .sort({ createdAt: 1 })
    .limit(100);
};

module.exports = { create, getAll, getById, join, leave, sendMessage, getMessages };
