/**
 * @file portfolio.controller.js — Portfolio Controller
 */

const portfolioService = require('./portfolio.service');
const catchAsync = require('../../middleware/catchAsync');
const AppError = require('../../shared/utils/AppError');
const { validationResult } = require('express-validator');

const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }
};

/**
 * Get current user's portfolio
 */
exports.getMyPortfolio = catchAsync(async (req, res) => {
  const portfolio = await portfolioService.getPortfolioByUserId(req.user._id);

  res.status(200).json({
    status: 'success',
    data: { portfolio }
  });
});

/**
 * Get any portfolio by roll number
 */
exports.getPortfolioByRollNumber = catchAsync(async (req, res) => {
  checkValidation(req);
  const portfolio = await portfolioService.getPortfolioByRollNumber(req.params.rollNumber);

  res.status(200).json({
    status: 'success',
    data: { portfolio }
  });
});

/**
 * Update basic portfolio (bio, links, skills)
 */
exports.updatePortfolio = catchAsync(async (req, res) => {
  checkValidation(req);
  const portfolio = await portfolioService.updatePortfolio(req.user._id, req.body);

  res.status(200).json({
    status: 'success',
    data: { portfolio }
  });
});

/**
 * Add Project
 */
exports.addProject = catchAsync(async (req, res) => {
  checkValidation(req);
  const portfolio = await portfolioService.addProject(req.user._id, req.body);

  res.status(201).json({
    status: 'success',
    data: { portfolio }
  });
});

/**
 * Remove Project
 */
exports.removeProject = catchAsync(async (req, res) => {
  checkValidation(req);
  const portfolio = await portfolioService.removeProject(req.user._id, req.params.id);

  res.status(200).json({
    status: 'success',
    data: { portfolio }
  });
});

/**
 * Add Experience
 */
exports.addExperience = catchAsync(async (req, res) => {
  checkValidation(req);
  const portfolio = await portfolioService.addExperience(req.user._id, req.body);

  res.status(201).json({
    status: 'success',
    data: { portfolio }
  });
});

/**
 * Remove Experience
 */
exports.removeExperience = catchAsync(async (req, res) => {
  checkValidation(req);
  const portfolio = await portfolioService.removeExperience(req.user._id, req.params.id);

  res.status(200).json({
    status: 'success',
    data: { portfolio }
  });
});

/**
 * Add Achievement
 */
exports.addAchievement = catchAsync(async (req, res) => {
  checkValidation(req);
  const portfolio = await portfolioService.addAchievement(req.user._id, req.body);

  res.status(201).json({
    status: 'success',
    data: { portfolio }
  });
});

/**
 * Remove Achievement
 */
exports.removeAchievement = catchAsync(async (req, res) => {
  checkValidation(req);
  const portfolio = await portfolioService.removeAchievement(req.user._id, req.params.id);

  res.status(200).json({
    status: 'success',
    data: { portfolio }
  });
});
