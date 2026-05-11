/**
 * @file portfolio.service.js — Portfolio Business Logic
 */

const Portfolio = require('./portfolio.model');
const User = require('../users/users.model');
const AppError = require('../../shared/utils/AppError');

/**
 * Get portfolio by User ID
 * Auto-creates an empty portfolio if one doesn't exist
 */
exports.getPortfolioByUserId = async (userId) => {
  let portfolio = await Portfolio.findOne({ userId }).populate('userId', 'fullName rollNumber department yearOfStudy email avatar badges role');
  
  if (!portfolio) {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    
    // Auto-create empty portfolio
    portfolio = await Portfolio.create({ userId });
    portfolio = await Portfolio.findById(portfolio._id).populate('userId', 'fullName rollNumber department yearOfStudy email avatar badges role');
  }
  
  return portfolio;
};

/**
 * Get portfolio by Roll Number (public view)
 */
exports.getPortfolioByRollNumber = async (rollNumber) => {
  const user = await User.findOne({ rollNumber: rollNumber.toUpperCase() });
  if (!user) throw new AppError('User not found', 404);
  
  return this.getPortfolioByUserId(user._id);
};

/**
 * Update basic portfolio info (bio, links, skills)
 */
exports.updatePortfolio = async (userId, updateData) => {
  let portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) {
    portfolio = await Portfolio.create({ userId });
  }

  // Allow updating specific fields
  if (updateData.bio !== undefined) portfolio.bio = updateData.bio;
  if (updateData.skills !== undefined) portfolio.skills = updateData.skills;
  if (updateData.profileImage !== undefined) portfolio.profileImage = updateData.profileImage;
  if (updateData.resumeUrl !== undefined) portfolio.resumeUrl = updateData.resumeUrl;
  if (updateData.cgpa !== undefined) portfolio.cgpa = updateData.cgpa;
  
  if (updateData.socialLinks) {
    portfolio.socialLinks = { ...portfolio.socialLinks, ...updateData.socialLinks };
  }

  await portfolio.save();
  return this.getPortfolioByUserId(userId);
};

// ── Array Operations (Projects, Experience, Achievements) ──

exports.addProject = async (userId, projectData) => {
  const portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) throw new AppError('Portfolio not found', 404);
  
  portfolio.projects.push(projectData);
  await portfolio.save();
  return portfolio;
};

exports.removeProject = async (userId, projectId) => {
  const portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) throw new AppError('Portfolio not found', 404);
  
  portfolio.projects = portfolio.projects.filter(p => p._id.toString() !== projectId.toString());
  await portfolio.save();
  return portfolio;
};

exports.addExperience = async (userId, experienceData) => {
  const portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) throw new AppError('Portfolio not found', 404);
  
  portfolio.experience.push(experienceData);
  await portfolio.save();
  return portfolio;
};

exports.removeExperience = async (userId, expId) => {
  const portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) throw new AppError('Portfolio not found', 404);
  
  portfolio.experience = portfolio.experience.filter(e => e._id.toString() !== expId.toString());
  await portfolio.save();
  return portfolio;
};

exports.addAchievement = async (userId, achievementData) => {
  const portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) throw new AppError('Portfolio not found', 404);
  
  portfolio.achievements.push(achievementData);
  await portfolio.save();
  return portfolio;
};

exports.removeAchievement = async (userId, achId) => {
  const portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) throw new AppError('Portfolio not found', 404);
  
  portfolio.achievements = portfolio.achievements.filter(a => a._id.toString() !== achId.toString());
  await portfolio.save();
  return portfolio;
};
