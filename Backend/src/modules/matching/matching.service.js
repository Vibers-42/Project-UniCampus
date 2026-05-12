/** @file matching.service.js */
const MatchRequest = require('./matching.model');
const AppError = require('../../shared/utils/AppError');

const create = async (data, userId) => MatchRequest.create({ ...data, requestedBy: userId });
const getAll = async (filters = {}) => {
  const query = { status: 'open' };
  if (filters.skill) query.skillsNeeded = { $in: [filters.skill] };
  return MatchRequest.find(query)
    .populate('requestedBy', 'fullName avatar email')
    .populate('matches.userId', 'fullName avatar email')
    .sort({ createdAt: -1 })
    .limit(30);
};
const getById = async (id) => {
  const m = await MatchRequest.findById(id)
    .populate('requestedBy', 'fullName avatar email')
    .populate('matches.userId', 'fullName avatar email');
  if (!m) throw new AppError('Match request not found', 404);
  return m;
};
const matchUser = async (id, userId) => {
  const m = await MatchRequest.findById(id);
  if (!m) throw new AppError('Match request not found', 404);
  if (m.matches.some(x => x.userId.toString() === userId.toString())) {
    throw new AppError('Already matched', 400);
  }
  m.matches.push({ userId, status: 'pending' });
  await m.save();
  return m;
};
const close = async (id, userId) => {
  const m = await MatchRequest.findById(id);
  if (!m) throw new AppError('Match request not found', 404);
  if (m.requestedBy.toString() !== userId.toString()) {
    throw new AppError('Not authorized', 403);
  }
  m.status = 'closed';
  await m.save();
  return m;
};

module.exports = { create, getAll, getById, matchUser, close };
