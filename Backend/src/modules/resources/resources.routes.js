/** @file resources.routes.js */
const { Router } = require('express');
const ctrl = require('./resources.controller');
const { validateCreate, validateId } = require('./resources.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');
const router = Router();
router.use(protect);

router.post('/', validateCreate, validate, ctrl.create);
router.get('/', ctrl.getAll);
router.get('/:id', validateId, validate, ctrl.getById);
router.patch('/:id/upvote', validateId, validate, ctrl.upvote);
router.delete('/:id', validateId, validate, ctrl.remove);

module.exports = router;
