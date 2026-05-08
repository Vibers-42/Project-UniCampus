/** @file resources.controller.js */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./resources.service');

const create  = catchAsync(async (req, res) => { const r = await svc.create(req.body, req.user.email); sendSuccess(res, r, 'Resource uploaded', 201); });
const getAll  = catchAsync(async (req, res) => { const r = await svc.getAll(req.query); sendSuccess(res, r, `Found ${r.length} resources`); });
const getById = catchAsync(async (req, res) => { const r = await svc.getById(req.params.id); sendSuccess(res, r, 'Resource fetched'); });
const upvote  = catchAsync(async (req, res) => { const r = await svc.upvote(req.params.id, req.user.email); sendSuccess(res, r, 'Upvote toggled'); });
const remove  = catchAsync(async (req, res) => { await svc.remove(req.params.id, req.user.email); sendSuccess(res, null, 'Resource deleted'); });

module.exports = { create, getAll, getById, upvote, remove };
