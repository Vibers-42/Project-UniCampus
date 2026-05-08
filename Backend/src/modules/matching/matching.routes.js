/** @file matching.routes.js */
const { Router } = require('express');
const ctrl = require('./matching.controller');
const { validateCreate, validateId } = require('./matching.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');
const router = Router();
router.use(protect);

router.post('/', validateCreate, validate, ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:id', validateId, validate, ctrl.getById);
router.post('/:id/match', validateId, validate, ctrl.match);
router.patch('/:id/close', validateId, validate, ctrl.close);

module.exports = router;
