/**
 * @file resources.routes.js — Resource Route Definitions
 *
 * PUBLIC INTERFACE:
 *   This is one of only two files in this module that can be imported
 *   outside the resources/ folder (the other is resources.service.js).
 *
 * ROUTES:
 *   POST   /                  → Create a new resource
 *   GET    /                  → List resources (filtered, paginated)
 *   GET    /:id               → Get a single resource
 *   PATCH  /:id/upvote        → Toggle upvote
 *   PATCH  /:id/download      → Increment download count
 *   DELETE /:id               → Delete resource (owner only)
 *
 * MIDDLEWARE ORDER:
 *   protect → [validation chain] → validate → controller
 */

const { Router } = require('express');
const ctrl = require('./resources.controller');
const { validateCreate, validateId, validateQuery } = require('./resources.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

// All resource routes require authentication
router.use(protect);

router.post('/', validateCreate, validate, ctrl.create);
router.get('/', validateQuery, validate, ctrl.getAll);
router.get('/:id', validateId, validate, ctrl.getById);
router.patch('/:id/upvote', validateId, validate, ctrl.upvote);
router.patch('/:id/download', validateId, validate, ctrl.download);
router.delete('/:id', validateId, validate, ctrl.remove);

module.exports = router;
