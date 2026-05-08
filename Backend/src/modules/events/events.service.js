/** @file events.service.js — Events Business Logic (scaffold) */
const Event = require('./events.model');

const create = async (data, email) => Event.create({ ...data, organiser: email });
const getAll = async (filters = {}) => {
  const query = {};
  if (filters.upcoming === 'true') query.date = { $gte: new Date() };
  return Event.find(query).sort({ date: 1 }).limit(30);
};
const getById = async (id) => {
  const ev = await Event.findById(id);
  if (!ev) { const e = new Error('Event not found'); e.statusCode = 404; throw e; }
  return ev;
};
const rsvp = async (id, email) => {
  const ev = await Event.findById(id);
  if (!ev) { const e = new Error('Event not found'); e.statusCode = 404; throw e; }
  if (ev.rsvpList.includes(email)) { const e = new Error('Already RSVPed'); e.statusCode = 400; throw e; }
  ev.rsvpList.push(email);
  await ev.save();
  return ev;
};
const checkin = async (id, email) => {
  // TODO: Implement QR-based check-in logic
  const ev = await Event.findById(id);
  if (!ev) { const e = new Error('Event not found'); e.statusCode = 404; throw e; }
  return { message: 'Check-in recorded.', eventId: id, email };
};

module.exports = { create, getAll, getById, rsvp, checkin };
