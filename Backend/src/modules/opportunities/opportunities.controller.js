const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./opportunities.service');

const create = catchAsync(async (req, res) => {
  const opportunity = await svc.create(req.body, req.user.id);
  sendSuccess(res, opportunity, 'Opportunity created successfully', 201);
});

const getAll = catchAsync(async (req, res) => {
  const { items, pagination } = await svc.getAll(req.query);
  sendSuccess(res, { items, pagination }, `Found ${pagination.totalCount} opportunities`);
});

const getById = catchAsync(async (req, res) => {
  const opportunity = await svc.getById(req.params.id);
  sendSuccess(res, opportunity, 'Opportunity fetched');
});

const remove = catchAsync(async (req, res) => {
  const result = await svc.remove(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, null, result.message);
});

module.exports = { create, getAll, getById, remove };
