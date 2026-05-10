const marketplaceService = require('./marketplace.service');
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const { validationResult } = require('express-validator');
const AppError = require('../../shared/utils/AppError');

const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }
};

exports.getAllListings = catchAsync(async (req, res) => {
  checkValidation(req);
  const data = await marketplaceService.getAll(req.query);
  sendSuccess(res, data, 'Listings fetched successfully');
});

exports.getListing = catchAsync(async (req, res) => {
  checkValidation(req);
  const item = await marketplaceService.getById(req.params.id);
  sendSuccess(res, item, 'Item details fetched successfully');
});

exports.createListing = catchAsync(async (req, res) => {
  checkValidation(req);
  const item = await marketplaceService.create(req.body, req.user.id);
  sendSuccess(res, item, 'Item listed successfully', 201);
});

exports.deleteListing = catchAsync(async (req, res) => {
  checkValidation(req);
  await marketplaceService.remove(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, null, 'Listing removed successfully');
});

exports.toggleSoldStatus = catchAsync(async (req, res) => {
  checkValidation(req);
  const item = await marketplaceService.markSold(req.params.id, req.user.id);
  sendSuccess(res, item, `Item marked as ${item.isSold ? 'Sold' : 'Available'}`);
});
