/** @file opportunities.routes.js */
const { Router } = require('express');
const ctrl = require('./opportunities.controller');
const { validateCreate, validateId } = require('./opportunities.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');
const router = Router();
router.use(protect);

router.post('/', validateCreate, validate, ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:id', validateId, validate, ctrl.getById);
router.post('/:id/apply', validateId, validate, ctrl.apply);
router.delete('/:id', validateId, validate, ctrl.remove);

module.exports = router;
