/**
 * @file notifications.service.js — Notifications Business Logic
 *
 * MIGRATION NOTE (2026-05-11):
 *   All queries now use `recipient` (ObjectId) instead of `userId` (email).
 *   Controller passes `req.user.id` (MongoDB _id) instead of `req.user.email`.
 *
 * PUBLIC INTERFACE:
 *   getAll(userId)           → list of notifications (newest first, max 50)
 *   getUnreadCount(userId)   → { count: Number }
 *   markRead(id, userId)     → updated notification
 *   markAllRead(userId)      → { modifiedCount }
 *   remove(id, userId)       → { message }
 *   create(data)             → new notification document
 */

const Notification = require('./notifications.model');
const AppError = require('../../shared/utils/AppError');

/**
 * Get all notifications for a user (newest first, limit 50).
 */
const getAll = async (userId) => {
  return Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
};

/**
 * Get count of unread notifications.
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ recipient: userId, isRead: false });
  return { count };
};

/**
 * Mark a single notification as read.
 */
const markRead = async (id, userId) => {
  const n = await Notification.findOneAndUpdate(
    { _id: id, recipient: userId },
    { isRead: true },
    { new: true }
  );
  if (!n) throw new AppError('Notification not found', 404);
  return n;
};

/**
 * Mark all notifications as read for a user.
 */
const markAllRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true } }
  );
  return { modifiedCount: result.modifiedCount };
};

/**
 * Delete a notification.
 */
const remove = async (id, userId) => {
  const n = await Notification.findOneAndDelete({ _id: id, recipient: userId });
  if (!n) throw new AppError('Notification not found', 404);
  return { message: 'Notification deleted.' };
};

/**
 * Create a new notification.
 * Called by shared/notificationService.js or directly from other modules.
 *
 * @param {Object} data — { recipient, type, title, body, relatedEntity, metadata }
 */
const create = async (data) => {
  return Notification.create(data);
};

module.exports = { getAll, getUnreadCount, markRead, markAllRead, remove, create };
