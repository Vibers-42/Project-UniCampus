/**
 * @file Route Aggregator
 * @description Central mount point for all API routes. Every module's routes
 *              are imported and mounted under a versioned prefix here.
 *
 * WHY THIS EXISTS:
 * - app.js stays clean — it only calls `app.use('/api/v1', routes)`.
 * - Adding a new module is one import + one line. No digging through app.js.
 * - API versioning (v1, v2) is handled naturally by changing the prefix.
 *
 * HOW TO ADD A NEW MODULE:
 * 1. Create `routes/moduleName.routes.js` with its Router.
 * 2. Create `controllers/moduleName.controller.js` with handler functions.
 * 3. Import the router here and mount it:
 *      const moduleRoutes = require('./moduleName.routes');
 *      router.use('/module', moduleRoutes);
 */

const { Router } = require('express');
const healthRoutes = require('./health.routes');

const router = Router();

// ───── Active Routes ─────
router.use('/health', healthRoutes);

// ───── Future Module Routes (uncomment as you build them) ─────
// const authRoutes = require('./auth.routes');
// const userRoutes = require('./user.routes');
// const marketplaceRoutes = require('./marketplace.routes');
// const eventRoutes = require('./event.routes');
// const clubRoutes = require('./club.routes');
// const notificationRoutes = require('./notification.routes');
// const lostFoundRoutes = require('./lostFound.routes');

// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/marketplace', marketplaceRoutes);
// router.use('/events', eventRoutes);
// router.use('/clubs', clubRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/lost-found', lostFoundRoutes);

module.exports = router;
