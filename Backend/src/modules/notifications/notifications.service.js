/** @file notifications.service.js (scaffold) */
const Notification = require('./notifications.model');
const AppError = require('../../shared/utils/AppError');

const getAll = async (email) => {
  return Notification.find({ userId: email }).sort({ createdAt: -1 }).limit(50);
};
const markRead = async (id, email) => {
  const n = await Notification.findOneAndUpdate(
    { _id: id, userId: email },
    { isRead: true },
    { new: true }
  );
  if (!n) throw new AppError('Notification not found', 404);
  return n;
};
const remove = async (id, email) => {
  const n = await Notification.findOneAndDelete({ _id: id, userId: email });
  if (!n) throw new AppError('Notification not found', 404);
  return { message: 'Notification deleted.' };
};

module.exports = { getAll, markRead, remove };
