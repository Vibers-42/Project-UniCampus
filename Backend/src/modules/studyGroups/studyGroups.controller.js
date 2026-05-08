/** @file studyGroups.controller.js */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./studyGroups.service');

const create   = catchAsync(async (req, res) => { const r = await svc.create(req.body, req.user.email); sendSuccess(res, r, 'Study group created', 201); });
const getAll   = catchAsync(async (req, res) => { const r = await svc.getAll(req.query); sendSuccess(res, r, `Found ${r.length} groups`); });
const getById  = catchAsync(async (req, res) => { const r = await svc.getById(req.params.id); sendSuccess(res, r, 'Group fetched'); });
const join     = catchAsync(async (req, res) => { const r = await svc.join(req.params.id, req.user.email); sendSuccess(res, r, 'Joined group'); });
const message  = catchAsync(async (req, res) => { const r = await svc.sendMessage(req.params.id, req.user.email, req.body.content, req.body.fileUrl); sendSuccess(res, r, 'Message sent', 201); });

module.exports = { create, getAll, getById, join, message };
