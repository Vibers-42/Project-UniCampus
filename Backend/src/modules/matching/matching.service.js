/** @file matching.service.js (scaffold) */
const MatchRequest = require('./matching.model');

const create = async (data, email) => MatchRequest.create({ ...data, requestedBy: email });
const getAll = async (filters = {}) => {
  const query = { status: 'open' };
  if (filters.skill) query.skillsNeeded = { $in: [filters.skill] };
  return MatchRequest.find(query).sort({ createdAt: -1 }).limit(30);
};
const getById = async (id) => {
  const m = await MatchRequest.findById(id);
  if (!m) { const e = new Error('Match request not found'); e.statusCode = 404; throw e; }
  return m;
};
const matchUser = async (id, email) => {
  const m = await MatchRequest.findById(id);
  if (!m) { const e = new Error('Match request not found'); e.statusCode = 404; throw e; }
  if (m.matches.some(x => x.email === email)) { const e = new Error('Already matched'); e.statusCode = 400; throw e; }
  m.matches.push({ email, status: 'pending' });
  await m.save();
  return m;
};
const close = async (id, email) => {
  const m = await MatchRequest.findById(id);
  if (!m) { const e = new Error('Match request not found'); e.statusCode = 404; throw e; }
  if (m.requestedBy !== email) { const e = new Error('Not authorized'); e.statusCode = 403; throw e; }
  m.status = 'closed';
  await m.save();
  return m;
};

module.exports = { create, getAll, getById, matchUser, close };
