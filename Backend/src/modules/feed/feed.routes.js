const { Router } = require('express');
const ctrl = require('./feed.controller');
const { validateCreatePost, validateCreateComment, validateId, validateQuery } = require('./feed.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

router.use(protect);

router.post('/', validateCreatePost, validate, ctrl.createPost);
router.get('/', validateQuery, validate, ctrl.getFeed);
router.get('/:id', validateId, validate, ctrl.getPost);
router.post('/:id/like', validateId, validate, ctrl.likePost);
router.post('/:id/comments', validateId, validateCreateComment, validate, ctrl.addComment);
router.get('/:id/comments', validateId, validateQuery, validate, ctrl.getComments);

module.exports = router;
