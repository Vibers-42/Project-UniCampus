/** @file resources.service.js — Resources Business Logic (scaffold) */
const Resource = require('./resources.model');

const create = async (data, email) => {
  return Resource.create({ ...data, uploadedBy: email });
};
const getAll = async (filters = {}) => {
  const query = {};
  if (filters.department) query.department = filters.department;
  if (filters.semester) query.semester = Number(filters.semester);
  if (filters.subject) query.subject = new RegExp(filters.subject, 'i');
  return Resource.find(query).sort({ createdAt: -1 }).limit(30);
};
const getById = async (id) => {
  const resource = await Resource.findById(id);
  if (!resource) { const err = new Error('Resource not found'); err.statusCode = 404; throw err; }
  return resource;
};
const upvote = async (id, email) => {
  // TODO: toggle upvote (add if not present, remove if present)
  const resource = await Resource.findById(id);
  if (!resource) { const err = new Error('Resource not found'); err.statusCode = 404; throw err; }
  const idx = resource.upvotes.indexOf(email);
  if (idx === -1) { resource.upvotes.push(email); } else { resource.upvotes.splice(idx, 1); }
  await resource.save();
  return resource;
};
const remove = async (id, email) => {
  const resource = await Resource.findById(id);
  if (!resource) { const err = new Error('Resource not found'); err.statusCode = 404; throw err; }
  if (resource.uploadedBy !== email) { const err = new Error('Not authorized'); err.statusCode = 403; throw err; }
  await resource.deleteOne();
  return { message: 'Resource deleted.' };
};

module.exports = { create, getAll, getById, upvote, remove };
