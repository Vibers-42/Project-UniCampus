/** @file events.controller.js */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./events.service');

const create  = catchAsync(async (req, res) => { const r = await svc.create(req.body, req.user.email); sendSuccess(res, r, 'Event created', 201); });
const getAll  = catchAsync(async (req, res) => { const r = await svc.getAll(req.query); sendSuccess(res, r, `Found ${r.length} events`); });
const getById = catchAsync(async (req, res) => { const r = await svc.getById(req.params.id); sendSuccess(res, r, 'Event fetched'); });
const rsvp    = catchAsync(async (req, res) => { const r = await svc.rsvp(req.params.id, req.user.email); sendSuccess(res, r, 'RSVP confirmed'); });
const checkin = catchAsync(async (req, res) => { const r = await svc.checkin(req.params.id, req.user.email); sendSuccess(res, r, 'Check-in successful'); });

module.exports = { create, getAll, getById, rsvp, checkin };
