/** @file notifications.service.js (scaffold) */
const Notification = require('./notifications.model');

const getAll = async (email) => {
  return Notification.find({ userId: email }).sort({ createdAt: -1 }).limit(50);
};
const markRead = async (id, email) => {
  const n = await Notification.findOneAndUpdate(
    { _id: id, userId: email },
    { isRead: true },
    { new: true }
  );
  if (!n) { const e = new Error('Notification not found'); e.statusCode = 404; throw e; }
  return n;
};
const remove = async (id, email) => {
  const n = await Notification.findOneAndDelete({ _id: id, userId: email });
  if (!n) { const e = new Error('Notification not found'); e.statusCode = 404; throw e; }
  return { message: 'Notification deleted.' };
};

module.exports = { getAll, markRead, remove };
