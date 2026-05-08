/** @file notifications.routes.js */
const { Router } = require('express');
const ctrl = require('./notifications.controller');
const { validateId } = require('./notifications.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');
const router = Router();
router.use(protect);

router.get('/', ctrl.getAll);
router.patch('/:id/read', validateId, validate, ctrl.markRead);
router.delete('/:id', validateId, validate, ctrl.remove);

module.exports = router;
