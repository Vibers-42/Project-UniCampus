/**
 * @file teammates.service.js — Teammates Business Logic
 */

const TeamProject = require('./teammates.model');
const AppError = require('../../shared/utils/AppError');

/**
 * Create a new team project listing
 */
exports.createProject = async (projectData) => {
  if (projectData.currentTeamSize >= projectData.requiredTeamSize) {
    throw new AppError('Current team size must be less than required total team size', 400);
  }
  
  const project = await TeamProject.create(projectData);
  return project;
};

/**
 * Get all team projects with optional filters
 */
exports.getAllProjects = async (query) => {
  // Base filter: mostly we want to see 'open' projects
  const filter = {};
  
  if (query.status) {
    filter.status = query.status;
  } else {
    filter.status = 'open';
  }

  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }

  // If techStack is provided as comma separated string
  if (query.techStack) {
    const stacks = query.techStack.split(',').map(s => new RegExp(s.trim(), 'i'));
    filter.techStack = { $in: stacks };
  }
  
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } }
    ];
  }

  const projects = await TeamProject.find(filter)
    .populate('creatorId', 'fullName avatar rollNumber badges role')
    .sort({ createdAt: -1 });

  return projects;
};

/**
 * Get a single project by ID
 */
exports.getProjectById = async (projectId) => {
  const project = await TeamProject.findById(projectId)
    .populate('creatorId', 'fullName avatar rollNumber badges role department yearOfStudy');

  if (!project) {
    throw new AppError('Project listing not found', 404);
  }

  return project;
};

/**
 * Update project status (e.g. close it)
 */
exports.updateProjectStatus = async (projectId, userId, status) => {
  const project = await TeamProject.findById(projectId);

  if (!project) {
    throw new AppError('Project listing not found', 404);
  }

  if (project.creatorId.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to modify this listing', 403);
  }

  if (!['open', 'closed'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  project.status = status;
  await project.save();

  return project;
};

/**
 * Delete a project listing
 */
exports.deleteProject = async (projectId, userId) => {
  const project = await TeamProject.findById(projectId);

  if (!project) {
    throw new AppError('Project listing not found', 404);
  }

  if (project.creatorId.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to delete this listing', 403);
  }

  await TeamProject.findByIdAndDelete(projectId);
};
