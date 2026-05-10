const { Router } = require('express');
const ctrl = require('./opportunities.controller');
const { validateCreate, validateId, validateQuery } = require('./opportunities.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

router.use(protect);

router.post('/', validateCreate, validate, ctrl.create);
router.get('/', validateQuery, validate, ctrl.getAll);
router.get('/:id', validateId, validate, ctrl.getById);
router.delete('/:id', validateId, validate, ctrl.remove);

module.exports = router;
