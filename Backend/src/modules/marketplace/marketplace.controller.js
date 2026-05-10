/** @file marketplace.controller.js */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./marketplace.service');

const create   = catchAsync(async (req, res) => { const r = await svc.create(req.body, req.user.email); sendSuccess(res, r, 'Listing created', 201); });
const getAll   = catchAsync(async (req, res) => { const { items, pagination } = await svc.getAll(req.query); sendSuccess(res, { items, pagination }, `Found ${pagination.totalCount} listings`); });
const getById  = catchAsync(async (req, res) => { const r = await svc.getById(req.params.id); sendSuccess(res, r, 'Listing fetched'); });
const markSold = catchAsync(async (req, res) => { const r = await svc.markSold(req.params.id, req.user.email, req.body.buyerEmail); sendSuccess(res, r, 'Marked as sold'); });
const remove   = catchAsync(async (req, res) => { await svc.remove(req.params.id, req.user.email); sendSuccess(res, null, 'Listing deleted'); });

module.exports = { create, getAll, getById, markSold, remove };
