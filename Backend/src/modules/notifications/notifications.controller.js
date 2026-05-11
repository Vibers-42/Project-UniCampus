/**
 * @file notifications.controller.js — Notifications HTTP Layer
 *
 * MIGRATION NOTE (2026-05-11):
 *   Now passes req.user.id (MongoDB ObjectId) to service instead of req.user.email.
 */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./notifications.service');

const getAll = catchAsync(async (req, res) => {
  const data = await svc.getAll(req.user.id);
  sendSuccess(res, data, 'Notifications fetched');
});

const getUnreadCount = catchAsync(async (req, res) => {
  const data = await svc.getUnreadCount(req.user.id);
  sendSuccess(res, data, 'Unread count fetched');
});

const markRead = catchAsync(async (req, res) => {
  const data = await svc.markRead(req.params.id, req.user.id);
  sendSuccess(res, data, 'Marked as read');
});

const markAllRead = catchAsync(async (req, res) => {
  const data = await svc.markAllRead(req.user.id);
  sendSuccess(res, data, 'All notifications marked as read');
});

const remove = catchAsync(async (req, res) => {
  const data = await svc.remove(req.params.id, req.user.id);
  sendSuccess(res, data, data.message);
});

module.exports = { getAll, getUnreadCount, markRead, markAllRead, remove };
