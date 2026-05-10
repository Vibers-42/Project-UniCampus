/**
 * @file routes/index.js — Central Route Aggregator
 *
 * SINGLE RESPONSIBILITY:
 *   Mounts all module routes under /api/v1.
 *   app.js calls app.use('/api/v1', routes) — this file handles the rest.
 *
 * ROUTE MAP:
 *   /api/v1/auth           → Auth (register, verify, refresh, logout)
 *   /api/v1/users          → User profiles (CRUD, search)
 *   /api/v1/resources      → Academic resources (CRUD, upvote, download)
 *   /api/v1/events         → Campus events (CRUD, RSVP)
 *   /api/v1/opportunities  → Internships, hackathons, referrals
 *   /api/v1/matching       → Teammate matching
 *   /api/v1/marketplace    → Buy/sell marketplace
 *   /api/v1/study-groups   → Study groups + messaging
 *   /api/v1/ai-chatbot     → AI assistant
 *   /api/v1/notifications  → User notifications
 *   /api/v1/admin          → Admin operations (admin role required)
 *
 * MODULE STATUS:
 *   ✅ auth, users, resources, events — fully implemented
 *   🔲 all others — scaffolded (routes + models + services, ready for Phase 2)
 *
 * HOW TO ADD A NEW MODULE:
 *   1. Build the module in src/modules/<name>/
 *   2. Require its routes file here.
 *   3. Mount it: router.use('/<name>', <name>Routes);
 */

const { Router } = require('express');

const router = Router();

// ───── Fully Implemented Modules ─────

const authRoutes = require('../modules/auth/auth.routes');
router.use('/auth', authRoutes);

const usersRoutes = require('../modules/users/users.routes');
router.use('/users', usersRoutes);

const resourcesRoutes = require('../modules/resources/resources.routes');
router.use('/resources', resourcesRoutes);

const eventsRoutes = require('../modules/events/events.routes');
router.use('/events', eventsRoutes);

const feedRoutes = require('../modules/feed/feed.routes');
router.use('/feed', feedRoutes);

const messagesRoutes = require('../modules/messages/messages.routes');
router.use('/messages', messagesRoutes);

// ───── Scaffolded Modules (Phase 2) ─────

const opportunitiesRoutes = require('../modules/opportunities/opportunities.routes');
router.use('/opportunities', opportunitiesRoutes);

const matchingRoutes = require('../modules/matching/matching.routes');
router.use('/matching', matchingRoutes);

const marketplaceRoutes = require('../modules/marketplace/marketplace.routes');
router.use('/marketplace', marketplaceRoutes);

const studyGroupsRoutes = require('../modules/studyGroups/studyGroups.routes');
router.use('/study-groups', studyGroupsRoutes);

const chatbotRoutes = require('../modules/aiChatbot/aiChatbot.routes');
router.use('/ai-chatbot', chatbotRoutes);

const notificationsRoutes = require('../modules/notifications/notifications.routes');
router.use('/notifications', notificationsRoutes);

const adminRoutes = require('../modules/admin/admin.routes');
router.use('/admin', adminRoutes);

module.exports = router;
