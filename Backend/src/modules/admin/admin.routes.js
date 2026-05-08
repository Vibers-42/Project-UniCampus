/** @file admin.routes.js — All routes require admin role */
const { Router } = require('express');
const ctrl = require('./admin.controller');
const { validateEmail, validateId } = require('./admin.validation');
const validate = require('../../middleware/validation.middleware');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const router = Router();

// All admin routes: authenticated + admin role only
router.use(protect, restrictTo('admin'));

router.get('/users', ctrl.getUsers);
router.patch('/users/:email/verify', validateEmail, validate, ctrl.verifyUser);
router.delete('/resources/:id', validateId, validate, ctrl.deleteResource);
router.delete('/events/:id', validateId, validate, ctrl.deleteEvent);

module.exports = router;
