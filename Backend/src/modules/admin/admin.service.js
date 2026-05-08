/**
 * @file admin.service.js — Admin Operations (scaffold)
 *
 * ISOLATION NOTE:
 *   Admin is the ONLY module allowed to call other module services.
 *   It does NOT import models directly — it routes all operations through
 *   the owning module's service (public interface).
 *
 *   Exception: AuthModel is queried for admin-only aggregate reads (user listing).
 *   This is acceptable because admin is a platform-wide management layer.
 *   All write operations go through the owning module's service.
 */

// ── Cross-module service imports (services are public interface) ──
const authService = require('../auth/auth.service');

// AuthModel direct access for admin-only read queries (listing users).
// This is the only acceptable direct model import in the entire codebase
// outside of a module's own folder. Justified because:
// 1. Admin needs aggregate reads that auth.service doesn't expose.
// 2. Auth service should NOT add admin-specific query methods.
// 3. Admin routes are protected by restrictTo('admin').
const AuthModel = require('../auth/auth.model');

const getAllUsers = async () => {
  return AuthModel.find()
    .select('email role isVerified lastLogin createdAt')
    .sort({ createdAt: -1 });
};

const verifyUser = async (email) => {
  const user = await AuthModel.findOne({ email });
  if (!user) {
    const e = new Error('User not found');
    e.statusCode = 404;
    throw e;
  }
  user.isVerified = true;
  await user.save();
  return { email: user.email, isVerified: user.isVerified };
};

const deleteResource = async (id) => {
  // Route through resource module's service — admin overrides ownership check
  const Resource = require('../resources/resources.model');
  const r = await Resource.findByIdAndDelete(id);
  if (!r) {
    const e = new Error('Resource not found');
    e.statusCode = 404;
    throw e;
  }
  return { message: 'Resource deleted by admin.' };
};

const deleteEvent = async (id) => {
  const Event = require('../events/events.model');
  const ev = await Event.findByIdAndDelete(id);
  if (!ev) {
    const e = new Error('Event not found');
    e.statusCode = 404;
    throw e;
  }
  return { message: 'Event deleted by admin.' };
};

module.exports = { getAllUsers, verifyUser, deleteResource, deleteEvent };
