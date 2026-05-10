/**
 * @file events.routes.js — Event Route Definitions
 */

const { Router } = require('express');
const ctrl = require('./events.controller');
const { validateCreate, validateUpdate, validateId, validateQuery, validateRsvp } = require('./events.validation');
const validate = require('../../middleware/validation.middleware');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

const router = Router();

// All event routes require authentication
router.use(protect);

// Creators (organizers, coordinators, club leads, admins, clubAdmins)
const creatorRoles = ['admin', 'clubAdmin', 'organizer', 'coordinator', 'club_lead'];

// IMPORTANT: /sidebar-data must come BEFORE /:id so Express doesn't treat it as an event ID
router.get('/sidebar-data', ctrl.getSidebarData);

router.post('/', restrictTo(...creatorRoles), validateCreate, validate, ctrl.create);
router.get('/', validateQuery, validate, ctrl.getAll);
router.get('/:id', validateId, validate, ctrl.getById);
router.patch('/:id', restrictTo(...creatorRoles), validateUpdate, validate, ctrl.update);
router.post('/:id/rsvp', validateId, validateRsvp, validate, ctrl.rsvp);
router.post('/:id/register', validateId, validate, ctrl.register);
router.post('/:id/interested', validateId, validate, ctrl.interested);
router.delete('/:id', restrictTo(...creatorRoles), validateId, validate, ctrl.remove);

module.exports = router;

