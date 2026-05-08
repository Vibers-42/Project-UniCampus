/**
 * @file uploadService.js — Cloudinary Upload/Delete Wrapper
 *
 * SINGLE RESPONSIBILITY:
 *   Provides a provider-agnostic interface for file upload and deletion
 *   via Cloudinary. Knows nothing about any module.
 *
 * EXPORTS:
 *   uploadFile(fileBuffer, folder, resourceType) — Upload a file buffer
 *   deleteFile(publicId)                         — Delete a file by public ID
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  IMPORTANT — UNICAMPUS ARCHITECTURE NOTE                           │
 * │                                                                     │
 * │  In UniCampus, the FRONTEND uploads files directly to Cloudinary   │
 * │  using an unsigned upload preset. The backend NEVER receives       │
 * │  binary file data from clients. MongoDB stores ONLY the Cloudinary │
 * │  URL string — never Buffers or binary.                             │
 * │                                                                     │
 * │  So when is this service used?                                      │
 * │                                                                     │
 * │  1. deleteFile() — When a resource is deleted (e.g., a marketplace │
 * │     listing is removed), the backend calls deleteFile() to clean   │
 * │     up the associated Cloudinary asset so storage isn't wasted.    │
 * │                                                                     │
 * │  2. uploadFile() — Reserved for server-side uploads only, such as  │
 * │     admin bulk operations or automated thumbnail generation.       │
 * │     Regular user uploads NEVER go through the backend.             │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * USAGE:
 *   const uploadService = require('../shared/uploadService');
 *
 *   // Delete when a listing is removed:
 *   await uploadService.deleteFile('unicampus/marketplace/abc123');
 *
 *   // Server-side upload (admin/automated only):
 *   const result = await uploadService.uploadFile(buffer, 'avatars', 'image');
 */

const cloudinary = require('../config/cloudinary');
const logger = require('./utils/logger');

/**
 * Upload a file buffer to Cloudinary.
 *
 * NOTE: In normal UniCampus operation, users upload directly from the
 * frontend. This function is for server-side admin/automated uploads only.
 *
 * @param {Buffer} fileBuffer   — The file as a Buffer
 * @param {string} folder       — Cloudinary folder (e.g., 'marketplace', 'avatars')
 * @param {string} [resourceType='image'] — 'image', 'video', 'raw', or 'auto'
 * @returns {Promise<Object>} Cloudinary upload result ({ public_id, secure_url, ... })
 */
const uploadFile = (fileBuffer, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `unicampus/${folder}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary upload failed: ${error.message}`);
          return reject(error);
        }
        logger.info(`Cloudinary upload success: ${result.public_id}`);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by its public ID.
 *
 * Used when a resource is deleted from the app (e.g., marketplace listing removed).
 * Prevents orphaned files from accumulating in Cloudinary storage.
 *
 * @param {string} publicId — Cloudinary public ID (e.g., 'unicampus/marketplace/abc123')
 * @returns {Promise<Object>} Cloudinary deletion result ({ result: 'ok' | 'not found' })
 */
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary delete: ${publicId} — result: ${result.result}`);
    return result;
  } catch (error) {
    logger.error(`Cloudinary delete failed for ${publicId}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
};
