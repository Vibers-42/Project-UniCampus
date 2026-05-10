/** @file studyGroups.service.js */
const { StudyGroup, GroupMessage } = require('./studyGroups.model');
const AppError = require('../../shared/utils/AppError');

const create = async (data, email) => {
  return StudyGroup.create({ ...data, createdBy: email, members: [email], memberCount: 1 });
};

const getAll = async (filters = {}) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.search) query.$text = { $search: filters.search };
  return StudyGroup.find(query).sort({ createdAt: -1 }).limit(30);
};

const getById = async (id) => {
  const g = await StudyGroup.findById(id);
  if (!g) throw new AppError('Study group not found', 404);
  return g;
};

const join = async (id, email) => {
  const g = await StudyGroup.findById(id);
  if (!g) throw new AppError('Study group not found', 404);
  if (g.members.includes(email)) throw new AppError('Already a member', 400);
  g.members.push(email);
  g.memberCount += 1;
  await g.save();
  return g;
};

const leave = async (id, email) => {
  const g = await StudyGroup.findById(id);
  if (!g) throw new AppError('Study group not found', 404);
  if (!g.members.includes(email)) throw new AppError('Not a member', 400);
  g.members = g.members.filter(m => m !== email);
  g.memberCount = Math.max(0, g.memberCount - 1);
  await g.save();
  return g;
};

const sendMessage = async (groupId, email, content) => {
  const g = await StudyGroup.findById(groupId);
  if (!g) throw new AppError('Study group not found', 404);
  if (!g.members.includes(email)) throw new AppError('Must be a member to message', 403);
  return GroupMessage.create({ groupId, sender: email, content });
};

const getMessages = async (groupId) => {
  return GroupMessage.find({ groupId }).sort({ createdAt: 1 }).limit(100);
};

module.exports = { create, getAll, getById, join, leave, sendMessage, getMessages };
