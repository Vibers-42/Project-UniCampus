/** @file events.routes.js */
const { Router } = require('express');
const ctrl = require('./events.controller');
const { validateCreate, validateId } = require('./events.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');
const router = Router();
router.use(protect);

router.post('/', validateCreate, validate, ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:id', validateId, validate, ctrl.getById);
router.post('/:id/rsvp', validateId, validate, ctrl.rsvp);
router.post('/:id/checkin', validateId, validate, ctrl.checkin);

module.exports = router;
