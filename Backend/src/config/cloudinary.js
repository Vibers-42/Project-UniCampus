/**
 * @file Cloudinary Configuration
 * @description Initializes the Cloudinary SDK with credentials from env.js.
 *
 * WHY THIS EXISTS:
 * - Cloudinary SDK must be configured once before any upload/delete call.
 * - Centralizing the config here means uploadService.js (and any future
 *   service that needs Cloudinary) just imports the pre-configured instance.
 *
 * ARCHITECTURE REMINDER:
 *   Backend NEVER receives binary files. Frontend uploads directly to
 *   Cloudinary using the unsigned upload preset. This SDK is used only
 *   for server-side admin operations (e.g., deleting orphaned images,
 *   generating signed URLs).
 *
 * USAGE:
 *   const cloudinary = require('./config/cloudinary');
 *   await cloudinary.uploader.destroy(publicId);
 */

const { v2: cloudinary } = require('cloudinary');
const env = require('./env');

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
