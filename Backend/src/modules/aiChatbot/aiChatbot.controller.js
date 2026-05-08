/** @file aiChatbot.controller.js */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./aiChatbot.service');

const ask           = catchAsync(async (req, res) => { const r = await svc.ask(req.user.email, req.body.message, req.body.sessionId); sendSuccess(res, r, 'AI response received'); });
const getHistory    = catchAsync(async (req, res) => { const r = await svc.getHistory(req.user.email); sendSuccess(res, r, 'Chat history fetched'); });
const deleteHistory = catchAsync(async (req, res) => { const r = await svc.deleteHistory(req.user.email); sendSuccess(res, r, r.message); });

module.exports = { ask, getHistory, deleteHistory };
