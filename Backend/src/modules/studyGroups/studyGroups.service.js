/** @file studyGroups.service.js (scaffold) */
const { StudyGroup, GroupMessage } = require('./studyGroups.model');
const AppError = require('../../shared/utils/AppError');

const create = async (data, email) => {
  return StudyGroup.create({ ...data, createdBy: email, members: [email] });
};
const getAll = async (filters = {}) => {
  const query = {};
  if (filters.department) query.department = filters.department;
  if (filters.subject) query.subject = new RegExp(filters.subject, 'i');
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
  await g.save();
  return g;
};
const sendMessage = async (groupId, email, content, fileUrl) => {
  const g = await StudyGroup.findById(groupId);
  if (!g) throw new AppError('Study group not found', 404);
  if (!g.members.includes(email)) throw new AppError('Must be a member to message', 403);
  return GroupMessage.create({ groupId, sender: email, content, fileUrl });
};

module.exports = { create, getAll, getById, join, sendMessage };
