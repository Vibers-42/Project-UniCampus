/**
 * @file admin.service.js — Admin Operations (scaffold)
 *
 * ISOLATION NOTE:
 *   Admin is the ONLY module with cross-module model access.
 *   This is intentional — admin is a platform-wide management layer
 *   that needs to bypass ownership checks (e.g., delete any resource).
 *
 *   Why admin can't use other module services for deletes:
 *   Module services enforce ownership (email === uploadedBy).
 *   Admin deletes bypass ownership — that's the whole point of admin.
 *
 *   RULES:
 *   - Admin reads and deletes only. Never creates on behalf of users.
 *   - All admin routes are protected by restrictTo('admin').
 *   - These cross-module imports are the ONLY exception in the codebase.
 */

const AuthModel = require('../auth/auth.model');
const Resource = require('../resources/resources.model');
const Event = require('../events/events.model');
const AppError = require('../../shared/utils/AppError');

const getAllUsers = async () => {
  return AuthModel.find()
    .select('email role isVerified lastLogin createdAt')
    .sort({ createdAt: -1 });
};

const verifyUser = async (email) => {
  const user = await AuthModel.findOne({ email });
  if (!user) throw new AppError('User not found', 404);
  user.isVerified = true;
  await user.save();
  return { email: user.email, isVerified: user.isVerified };
};

const deleteResource = async (id) => {
  const r = await Resource.findByIdAndDelete(id);
  if (!r) throw new AppError('Resource not found', 404);
  return { message: 'Resource deleted by admin.' };
};

const deleteEvent = async (id) => {
  const ev = await Event.findByIdAndDelete(id);
  if (!ev) throw new AppError('Event not found', 404);
  return { message: 'Event deleted by admin.' };
};

module.exports = { getAllUsers, verifyUser, deleteResource, deleteEvent };
