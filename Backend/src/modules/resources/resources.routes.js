/**
 * @file resources.routes.js — Resource Route Definitions
 *
 * PUBLIC INTERFACE:
 *   This is one of only two files in this module that can be imported
 *   outside the resources/ folder (the other is resources.service.js).
 *
 * ROUTES:
 *   GET    /                     → List resources (filtered, paginated, sorted)
 *   GET    /subjects             → Get subjects for autocomplete (dept+sem)
 *   POST   /                     → Upload new resource (multipart/form-data)
 *   GET    /:id                  → Get a single resource (uploader populated)
 *   POST   /:id/vote             → Toggle upvote
 *   POST   /:id/rate             → Submit quality rating (1-5)
 *   POST   /:id/download         → Increment download count → return fileUrl
 *   DELETE /:id                  → Delete resource (owner or admin only)
 *
 * FILE UPLOAD:
 *   multer memoryStorage — file buffer is streamed to Cloudinary by service.
 *   Never saved to disk. 50MB limit. Accepts pdf, doc, docx, images.
 *
 * MIDDLEWARE ORDER:
 *   protect → [multer] → [validation chain] → validate → controller
 */

const { Router } = require('express');
const multer = require('multer');
const ctrl = require('./resources.controller');
const { validateCreate, validateId, validateQuery, validateRating } = require('./resources.validation');
const validate = require('../../middleware/validation.middleware');
const { protect } = require('../../middleware/auth.middleware');

const router = Router();

// ── Multer: memoryStorage only — never saves to disk ──
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// All resource routes require authentication
router.use(protect);

// List resources
router.get('/', validateQuery, validate, ctrl.getAll);

// Subject autocomplete for a department+semester
router.get('/subjects', ctrl.getSubjects);

// Upload new resource (multipart/form-data with 'file' field)
router.post('/', upload.single('file'), validateCreate, validate, ctrl.create);

// Single resource
router.get('/:id', validateId, validate, ctrl.getById);

// Interactions
router.post('/:id/vote', validateId, validate, ctrl.vote);
router.post('/:id/rate', validateRating, validate, ctrl.rate);
router.post('/:id/download', validateId, validate, ctrl.download);

// Delete (owner or admin)
router.delete('/:id', validateId, validate, ctrl.remove);

module.exports = router;
