/**
 * @file upload.middleware.js — File Upload Validation
 *
 * SINGLE RESPONSIBILITY:
 *   Configures Multer for file uploads with strict validation.
 *   Stores files in memory (Buffer) for streaming to Cloudinary.
 *
 * SECURITY:
 *   - Explicit MIME type whitelist — only image/jpeg, image/png,
 *     image/webp, and application/pdf are allowed.
 *   - File size capped at 10MB.
 *   - Rejects executables, scripts, and any non-whitelisted types.
 *   - Extension-based validation as a secondary check.
 *
 * USAGE:
 *   const upload = require('../middleware/upload.middleware');
 *   router.post('/', upload.single('file'), controller.uploadFile);
 */

const multer = require('multer');
const AppError = require('../shared/utils/AppError');

// Store file in memory to upload to Cloudinary buffer stream
const storage = multer.memoryStorage();

/**
 * Allowed MIME types — explicit whitelist.
 * Any file type not in this set is rejected immediately.
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

/**
 * Allowed file extensions — secondary validation layer.
 * Prevents MIME type spoofing (e.g., renaming .exe to .jpg).
 */
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp|pdf)$/i;

const fileFilter = (req, file, cb) => {
  // Check MIME type against whitelist
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new AppError(
        `File type "${file.mimetype}" is not allowed. Accepted: JPEG, PNG, WebP, PDF.`,
        400
      ),
      false
    );
  }

  // Secondary check: file extension
  if (!ALLOWED_EXTENSIONS.test(file.originalname)) {
    return cb(
      new AppError(
        `File extension not allowed. Accepted: .jpg, .jpeg, .png, .webp, .pdf`,
        400
      ),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

module.exports = upload;
