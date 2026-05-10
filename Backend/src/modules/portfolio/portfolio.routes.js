/**
 * @file portfolio.routes.js — Portfolio Routes
 */

const { Router } = require('express');
const portfolioController = require('./portfolio.controller');
const validation = require('./portfolio.validation');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

// Protect all portfolio routes
router.use(protect);

// ── GET Routes ──
router.get('/me', portfolioController.getMyPortfolio);
router.get('/:rollNumber', validation.rollNumberValidation, portfolioController.getPortfolioByRollNumber);

// ── PUT/POST Routes (Current User Only) ──
router.put('/me', validation.updatePortfolioValidation, portfolioController.updatePortfolio);

// Projects
router.post('/me/projects', validation.addProjectValidation, portfolioController.addProject);
router.delete('/me/projects/:id', validation.idValidation, portfolioController.removeProject);

// Experience
router.post('/me/experience', validation.addExperienceValidation, portfolioController.addExperience);
router.delete('/me/experience/:id', validation.idValidation, portfolioController.removeExperience);

// Achievements
router.post('/me/achievements', validation.addAchievementValidation, portfolioController.addAchievement);
router.delete('/me/achievements/:id', validation.idValidation, portfolioController.removeAchievement);

module.exports = router;
