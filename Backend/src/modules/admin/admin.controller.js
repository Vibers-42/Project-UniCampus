/** @file admin.controller.js */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./admin.service');

const getUsers       = catchAsync(async (req, res) => { const r = await svc.getAllUsers(); sendSuccess(res, r, `Found ${r.length} users`); });
const verifyUser     = catchAsync(async (req, res) => { const r = await svc.verifyUser(req.params.email); sendSuccess(res, r, 'User verified'); });
const deleteResource = catchAsync(async (req, res) => { const r = await svc.deleteResource(req.params.id); sendSuccess(res, r, r.message); });
const deleteEvent    = catchAsync(async (req, res) => { const r = await svc.deleteEvent(req.params.id); sendSuccess(res, r, r.message); });

module.exports = { getUsers, verifyUser, deleteResource, deleteEvent };
