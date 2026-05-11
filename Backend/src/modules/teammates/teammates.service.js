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

  if (query.creatorId) {
    filter.creatorId = query.creatorId;
  }

  // If techStack is provided as comma separated string
  if (query.techStack) {
    const stacks = query.techStack.split(',').map(s => new RegExp(s.trim(), 'i'));
    filter.techStack = { $in: stacks };
  }
  
  // If requiredSkills is provided as comma separated string
  if (query.requiredSkills) {
    const skills = query.requiredSkills.split(',').map(s => new RegExp(s.trim(), 'i'));
    filter.requiredSkills = { $in: skills };
  }
  
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { shortDescription: { $regex: query.search, $options: 'i' } },
      { detailedDescription: { $regex: query.search, $options: 'i' } },
      { problemStatement: { $regex: query.search, $options: 'i' } }
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
 * Update project details
 */
exports.updateProject = async (projectId, userId, updateData) => {
  const project = await TeamProject.findById(projectId);

  if (!project) {
    throw new AppError('Project listing not found', 404);
  }

  if (project.creatorId.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to modify this listing', 403);
  }

  // Prevent updating creatorId
  delete updateData.creatorId;

  // Validate team size if provided
  const currentSize = updateData.currentTeamSize || project.currentTeamSize;
  const requiredSize = updateData.requiredTeamSize || project.requiredTeamSize;
  if (currentSize >= requiredSize) {
    throw new AppError('Current team size must be less than required total team size', 400);
  }

  Object.assign(project, updateData);
  await project.save();

  return project;
};

const uploadService = require('../../shared/uploadService');

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

  // Delete associated attachments from Cloudinary
  if (project.attachments && project.attachments.length > 0) {
    for (const attachment of project.attachments) {
      // Use structured publicId if available, fall back to URL extraction
      const publicId = attachment.publicId || uploadService.extractPublicId(attachment.url || attachment);
      if (publicId) {
        await uploadService.deleteFile(publicId).catch(err => {
          // Log but don't fail deletion if cloudinary fails
          console.error(`Failed to delete Cloudinary file ${publicId}:`, err);
        });
      }
    }
  }

  await TeamProject.findByIdAndDelete(projectId);
};
