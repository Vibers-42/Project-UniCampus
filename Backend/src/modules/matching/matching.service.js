/** @file matching.service.js (scaffold) */
const MatchRequest = require('./matching.model');
const AppError = require('../../shared/utils/AppError');

const create = async (data, email) => MatchRequest.create({ ...data, requestedBy: email });
const getAll = async (filters = {}) => {
  const query = { status: 'open' };
  if (filters.skill) query.skillsNeeded = { $in: [filters.skill] };
  return MatchRequest.find(query).sort({ createdAt: -1 }).limit(30);
};
const getById = async (id) => {
  const m = await MatchRequest.findById(id);
  if (!m) throw new AppError('Match request not found', 404);
  return m;
};
const matchUser = async (id, email) => {
  const m = await MatchRequest.findById(id);
  if (!m) throw new AppError('Match request not found', 404);
  if (m.matches.some(x => x.email === email)) throw new AppError('Already matched', 400);
  m.matches.push({ email, status: 'pending' });
  await m.save();
  return m;
};
const close = async (id, email) => {
  const m = await MatchRequest.findById(id);
  if (!m) throw new AppError('Match request not found', 404);
  if (m.requestedBy !== email) throw new AppError('Not authorized', 403);
  m.status = 'closed';
  await m.save();
  return m;
};

module.exports = { create, getAll, getById, matchUser, close };
