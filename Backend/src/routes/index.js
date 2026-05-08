/**
 * @file routes/index.js — Central Route Aggregator
 *
 * SINGLE RESPONSIBILITY:
 *   Mounts all module routes under /api/v1.
 *   app.js calls app.use('/api/v1', routes) — this file handles the rest.
 *
 * ROUTE MAP:
 *   /api/v1/auth           → Auth (register, verify, refresh, logout)
 *   /api/v1/users          → User profiles
 *   /api/v1/resources      → Academic resources
 *   /api/v1/events         → Campus events
 *   /api/v1/opportunities  → Internships, hackathons, referrals
 *   /api/v1/matching       → Teammate matching
 *   /api/v1/marketplace    → Buy/sell marketplace
 *   /api/v1/study-groups   → Study groups + messaging
 *   /api/v1/ai-chatbot     → AI assistant
 *   /api/v1/notifications  → User notifications
 *   /api/v1/admin          → Admin operations
 *
 * HOW TO ADD A NEW MODULE:
 *   1. Build the module in src/modules/<name>/
 *   2. Require its routes file here.
 *   3. Mount it: router.use('/<name>', <name>Routes);
 */

const { Router } = require('express');

const router = Router();

// ───── Module Routes ─────

// Auth (fully implemented — OTP-based registration and JWT auth)
const authRoutes = require('../modules/auth/auth.routes');
router.use('/auth', authRoutes);

// Users (fully implemented — profile CRUD and search)
const usersRoutes = require('../modules/users/users.routes');
router.use('/users', usersRoutes);

// Resources (scaffold — academic resource sharing)
const resourcesRoutes = require('../modules/resources/resources.routes');
router.use('/resources', resourcesRoutes);

// Events (scaffold — campus events and RSVP)
const eventsRoutes = require('../modules/events/events.routes');
router.use('/events', eventsRoutes);

// Opportunities (scaffold — internships, hackathons, referrals)
const opportunitiesRoutes = require('../modules/opportunities/opportunities.routes');
router.use('/opportunities', opportunitiesRoutes);

// Matching (scaffold — teammate finder)
const matchingRoutes = require('../modules/matching/matching.routes');
router.use('/matching', matchingRoutes);

// Marketplace (scaffold — buy/sell platform)
const marketplaceRoutes = require('../modules/marketplace/marketplace.routes');
router.use('/marketplace', marketplaceRoutes);

// Study Groups (scaffold — groups + messaging)
const studyGroupsRoutes = require('../modules/studyGroups/studyGroups.routes');
router.use('/study-groups', studyGroupsRoutes);

// AI Chatbot (scaffold — LLM-powered assistant)
const chatbotRoutes = require('../modules/aiChatbot/aiChatbot.routes');
router.use('/ai-chatbot', chatbotRoutes);

// Notifications (scaffold — in-app notifications)
const notificationsRoutes = require('../modules/notifications/notifications.routes');
router.use('/notifications', notificationsRoutes);

// Admin (scaffold — platform management, admin role required)
const adminRoutes = require('../modules/admin/admin.routes');
router.use('/admin', adminRoutes);

module.exports = router;
