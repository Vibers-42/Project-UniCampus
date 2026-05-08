/** @file studyGroups.service.js (scaffold) */
const { StudyGroup, GroupMessage } = require('./studyGroups.model');

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
  if (!g) { const e = new Error('Study group not found'); e.statusCode = 404; throw e; }
  return g;
};
const join = async (id, email) => {
  const g = await StudyGroup.findById(id);
  if (!g) { const e = new Error('Study group not found'); e.statusCode = 404; throw e; }
  if (g.members.includes(email)) { const e = new Error('Already a member'); e.statusCode = 400; throw e; }
  g.members.push(email);
  await g.save();
  return g;
};
const sendMessage = async (groupId, email, content, fileUrl) => {
  const g = await StudyGroup.findById(groupId);
  if (!g) { const e = new Error('Study group not found'); e.statusCode = 404; throw e; }
  if (!g.members.includes(email)) { const e = new Error('Must be a member to message'); e.statusCode = 403; throw e; }
  return GroupMessage.create({ groupId, sender: email, content, fileUrl });
};

module.exports = { create, getAll, getById, join, sendMessage };
