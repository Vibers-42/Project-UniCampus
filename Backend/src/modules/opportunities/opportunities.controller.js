/** @file opportunities.controller.js */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./opportunities.service');

const create  = catchAsync(async (req, res) => { const r = await svc.create(req.body, req.user.email); sendSuccess(res, r, 'Opportunity posted', 201); });
const getAll  = catchAsync(async (req, res) => { const r = await svc.getAll(req.query); sendSuccess(res, r, `Found ${r.length} opportunities`); });
const getById = catchAsync(async (req, res) => { const r = await svc.getById(req.params.id); sendSuccess(res, r, 'Opportunity fetched'); });
const apply   = catchAsync(async (req, res) => { const r = await svc.apply(req.params.id, req.user.email); sendSuccess(res, r, 'Application submitted'); });
const remove  = catchAsync(async (req, res) => { await svc.remove(req.params.id, req.user.email); sendSuccess(res, null, 'Opportunity deleted'); });

module.exports = { create, getAll, getById, apply, remove };
