/**
 * @file teammates.controller.js — Teammates Controller
 */

const teammatesService = require('./teammates.service');
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
 * Create a new team project listing
 */
exports.createProject = catchAsync(async (req, res) => {
  checkValidation(req);
  
  const projectData = {
    ...req.body,
    creatorId: req.user._id
  };

  const project = await teammatesService.createProject(projectData);

  res.status(201).json({
    status: 'success',
    data: { project }
  });
});

/**
 * Get all team projects
 */
exports.getAllProjects = catchAsync(async (req, res) => {
  checkValidation(req);
  
  const projects = await teammatesService.getAllProjects(req.query);

  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: { projects }
  });
});

/**
 * Get a single project by ID
 */
exports.getProjectById = catchAsync(async (req, res) => {
  checkValidation(req);
  
  const project = await teammatesService.getProjectById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { project }
  });
});

/**
 * Update project status
 */
exports.updateProjectStatus = catchAsync(async (req, res) => {
  checkValidation(req);
  
  const project = await teammatesService.updateProjectStatus(
    req.params.id, 
    req.user._id, 
    req.body.status
  );

  res.status(200).json({
    status: 'success',
    data: { project }
  });
});

/**
 * Delete a project listing
 */
exports.deleteProject = catchAsync(async (req, res) => {
  checkValidation(req);
  
  await teammatesService.deleteProject(req.params.id, req.user._id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
