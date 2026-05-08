/** @file opportunities.service.js (scaffold) */
const Opportunity = require('./opportunities.model');

const create = async (data, email) => Opportunity.create({ ...data, postedBy: email });
const getAll = async (filters = {}) => {
  const query = {};
  if (filters.type) query.type = filters.type;
  if (filters.active !== 'false') query.deadline = { $gte: new Date() };
  return Opportunity.find(query).sort({ createdAt: -1 }).limit(30);
};
const getById = async (id) => {
  const o = await Opportunity.findById(id);
  if (!o) { const e = new Error('Opportunity not found'); e.statusCode = 404; throw e; }
  return o;
};
const apply = async (id, email) => {
  const o = await Opportunity.findById(id);
  if (!o) { const e = new Error('Opportunity not found'); e.statusCode = 404; throw e; }
  if (o.applicants.includes(email)) { const e = new Error('Already applied'); e.statusCode = 400; throw e; }
  o.applicants.push(email);
  await o.save();
  return o;
};
const remove = async (id, email) => {
  const o = await Opportunity.findById(id);
  if (!o) { const e = new Error('Opportunity not found'); e.statusCode = 404; throw e; }
  if (o.postedBy !== email) { const e = new Error('Not authorized'); e.statusCode = 403; throw e; }
  await o.deleteOne();
  return { message: 'Opportunity deleted.' };
};

module.exports = { create, getAll, getById, apply, remove };
