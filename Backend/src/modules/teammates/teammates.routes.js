/**
 * @file teammates.routes.js — Teammates Module Routes
 */

const { Router } = require('express');
const teammatesController = require('./teammates.controller');
const validation = require('./teammates.validation');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

// All teammate routes require authentication
router.use(protect);

router.route('/')
  .get(validation.getProjectsValidation, teammatesController.getAllProjects)
  .post(validation.createProjectValidation, teammatesController.createProject);

router.route('/:id')
  .get(validation.projectIdValidation, teammatesController.getProjectById)
  .patch(validation.updateStatusValidation, teammatesController.updateProjectStatus)
  .delete(validation.projectIdValidation, teammatesController.deleteProject);

module.exports = router;
