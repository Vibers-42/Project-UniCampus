/**
 * @file events.controller.js — Event Request Handlers
 */

const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./events.service');

const create = catchAsync(async (req, res) => {
  const event = await svc.create(req.body, req.user.id);
  sendSuccess(res, event, 'Event created successfully', 201);
});

const getAll = catchAsync(async (req, res) => {
  const { items, pagination } = await svc.getAll(req.query);
  sendSuccess(res, { items, pagination }, `Found ${pagination.totalCount} events`);
});

const getById = catchAsync(async (req, res) => {
  const event = await svc.getById(req.params.id, req.user.id);
  sendSuccess(res, event, 'Event fetched');
});

const update = catchAsync(async (req, res) => {
  const event = await svc.update(req.params.id, req.body, req.user.id);
  sendSuccess(res, event, 'Event updated successfully');
});



const remove = catchAsync(async (req, res) => {
  const result = await svc.remove(req.params.id, req.user.id);
  sendSuccess(res, null, result.message);
});

const getSidebarData = catchAsync(async (req, res) => {
  const data = await svc.getSidebarData(req.user.id);
  sendSuccess(res, data, 'Sidebar data fetched');
});

const rsvp = catchAsync(async (req, res) => {
  const data = await svc.rsvp(req.params.id, req.user.id);
  sendSuccess(res, data, data.registered ? 'Registered for event' : 'Registration cancelled');
});

module.exports = { create, getAll, getById, update, remove, rsvp, getSidebarData };

