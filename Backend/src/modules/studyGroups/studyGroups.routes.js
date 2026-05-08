/** @file studyGroups.routes.js */
const { Router } = require('express');
const ctrl = require('./studyGroups.controller');
const { validateCreate, validateId, validateMessage } = require('./studyGroups.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');
const router = Router();
router.use(protect);

router.post('/', validateCreate, validate, ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:id', validateId, validate, ctrl.getById);
router.post('/:id/join', validateId, validate, ctrl.join);
router.post('/:id/message', validateMessage, validate, ctrl.message);

module.exports = router;
