/**
 * @file events.routes.js — Event Route Definitions
 *
 * PUBLIC INTERFACE:
 *   This is one of only two files in this module that can be imported
 *   outside the events/ folder (the other is events.service.js).
 *
 * ROUTES:
 *   POST   /                  → Create a new event
 *   GET    /                  → List events (filtered, paginated)
 *   GET    /:id               → Get a single event
 *   PATCH  /:id               → Update event (organiser only)
 *   POST   /:id/rsvp          → Toggle RSVP
 *   DELETE /:id               → Delete event (organiser only)
 *
 * MIDDLEWARE ORDER:
 *   protect → [validation chain] → validate → controller
 */

const { Router } = require('express');
const ctrl = require('./events.controller');
const { validateCreate, validateUpdate, validateId, validateQuery } = require('./events.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

// All event routes require authentication
router.use(protect);

router.post('/', validateCreate, validate, ctrl.create);
router.get('/', validateQuery, validate, ctrl.getAll);
router.get('/:id', validateId, validate, ctrl.getById);
router.patch('/:id', validateUpdate, validate, ctrl.update);
router.post('/:id/rsvp', validateId, validate, ctrl.rsvp);
router.delete('/:id', validateId, validate, ctrl.remove);

module.exports = router;
