/** @file notifications.controller.js */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./notifications.service');

const getAll   = catchAsync(async (req, res) => { const r = await svc.getAll(req.user.email); sendSuccess(res, r, 'Notifications fetched'); });
const markRead = catchAsync(async (req, res) => { const r = await svc.markRead(req.params.id, req.user.email); sendSuccess(res, r, 'Marked as read'); });
const remove   = catchAsync(async (req, res) => { const r = await svc.remove(req.params.id, req.user.email); sendSuccess(res, r, r.message); });

module.exports = { getAll, markRead, remove };
