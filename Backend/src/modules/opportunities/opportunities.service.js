/** @file opportunities.service.js (scaffold) */
const Opportunity = require('./opportunities.model');
const AppError = require('../../shared/utils/AppError');

const create = async (data, email) => Opportunity.create({ ...data, postedBy: email });
const getAll = async (filters = {}) => {
  const query = {};
  if (filters.type) query.type = filters.type;
  if (filters.active !== 'false') query.deadline = { $gte: new Date() };
  return Opportunity.find(query).sort({ createdAt: -1 }).limit(30);
};
const getById = async (id) => {
  const o = await Opportunity.findById(id);
  if (!o) throw new AppError('Opportunity not found', 404);
  return o;
};
const apply = async (id, email) => {
  const o = await Opportunity.findById(id);
  if (!o) throw new AppError('Opportunity not found', 404);
  if (o.applicants.includes(email)) throw new AppError('Already applied', 400);
  o.applicants.push(email);
  await o.save();
  return o;
};
const remove = async (id, email) => {
  const o = await Opportunity.findById(id);
  if (!o) throw new AppError('Opportunity not found', 404);
  if (o.postedBy !== email) throw new AppError('Not authorized', 403);
  await o.deleteOne();
  return { message: 'Opportunity deleted.' };
};

module.exports = { create, getAll, getById, apply, remove };
