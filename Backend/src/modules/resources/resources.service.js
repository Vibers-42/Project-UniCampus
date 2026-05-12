/**
 * @file resources.service.js — Academic Resources Business Logic
 *
 * SINGLE RESPONSIBILITY:
 *   All resource-related business logic. No req/res objects — pure logic.
 *
 * PUBLIC INTERFACE:
 *   getAll(filters)            → { items, totalPages, currentPage }
 *   getSubjects(dept, sem)     → subjects[]
 *   create(file, body, userId, io) → new resource document (or 409 on duplicate)
 *   getById(id)                → resource document (uploadedBy populated)
 *   vote(id, userId)           → resource with toggled upvote
 *   rate(id, userId, rating)   → updated resource
 *   incrementDownload(id, userId, io) → { downloadUrl }
 *   remove(id, userId)         → { success: true }
 */

const crypto = require('crypto');
const Resource = require('./resources.model');
const ResourceIndex = require('./resourceIndex.model');
const Post = require('../feed/post.model');
const Notification = require('../notifications/notifications.model');
const AppError = require('../../shared/utils/AppError');
const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');
const uploadService = require('../../shared/uploadService');
const logger = require('../../shared/utils/logger');

// Lazy-require User model to avoid circular dependency issues
const getUserModel = () => require('../users/users.model');

/**
 * GET /api/resources
 * Paginated, filtered, sorted list of resources.
 *
 * @param {Object} filters — Query params
 * @returns {Promise<{ items, totalPages, currentPage }>}
 */
const getAll = async (filters = {}) => {
  const query = {};

  if (filters.department) {
    query.department = new RegExp(`^${filters.department}$`, 'i');
  }
  if (filters.year) {
    query.year = Number(filters.year);
  }
  if (filters.semester) {
    query.semester = Number(filters.semester);
  }
  if (filters.subject) {
    query.subject = new RegExp(filters.subject, 'i');
  }
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.isExamPeriod !== undefined) {
    query.isExamPeriod = filters.isExamPeriod === 'true';
  }
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const { page, limit, skip } = parsePagination(filters);

  // Sort options
  let sortOpt = { createdAt: -1 }; // default: newest
  if (filters.sort === 'most-downloaded') sortOpt = { downloadCount: -1 };
  else if (filters.sort === 'top-rated') sortOpt = { qualityRating: -1 };
  else if (filters.sort === 'exam-relevant') {
    sortOpt = { isExamPeriod: -1, qualityRating: -1 };
  }

  const [items, totalCount] = await Promise.all([
    Resource.find(query)
      .sort(sortOpt)
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'fullName avatar department year')
      .lean(),
    Resource.countDocuments(query),
  ]);

  const pagination = buildPaginationResult(page, limit, totalCount);

  return {
    items,
    totalPages: pagination.totalPages,
    currentPage: pagination.page,
    totalCount: pagination.totalCount,
  };
};

/**
 * GET /api/resources/subjects
 * Returns subjects for a given department+semester for autocomplete.
 *
 * @param {string} department
 * @param {number} semester
 * @returns {Promise<string[]>}
 */
const getSubjects = async (department, semester) => {
  const index = await ResourceIndex.findOne({
    department: new RegExp(`^${department}$`, 'i'),
    semester: Number(semester),
  });
  return index ? index.subjects : [];
};

/**
 * POST /api/resources
 * Upload a resource file to Cloudinary, save to MongoDB, create a feed post.
 *
 * @param {Buffer}   fileBuffer  — Multer file buffer
 * @param {string}   mimetype    — File MIME type from multer
 * @param {Object}   body        — Validated request body
 * @param {ObjectId} userId      — Logged-in user's MongoDB _id
 * @param {Object}   io          — Socket.io server instance
 * @returns {Promise<Object>} Created resource document
 * @throws {AppError} 409 if duplicate file detected
 */
const create = async (fileBuffer, mimetype, body, userId, io) => {
  const { title, description, category, department, year, semester, subject, tags, isExamPeriod } = body;

  // 1. Determine fileType from MIME
  let fileType = 'other';
  if (mimetype === 'application/pdf') fileType = 'pdf';
  else if (mimetype.includes('word') || mimetype.includes('document')) fileType = 'doc';
  else if (mimetype.startsWith('image/')) fileType = 'image';
  // Normalize to 'pdf' | 'doc' | 'image' — default 'pdf' for any raw
  if (!['pdf', 'doc', 'image'].includes(fileType)) fileType = 'pdf';

  // 2. Compute MD5 hash of the file buffer for duplicate detection
  const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');

  // 3. Check for duplicate: same hash + same department + same semester
  if (department && semester) {
    const existing = await Resource.findOne({
      fileHash,
      department: new RegExp(`^${department}$`, 'i'),
      semester: Number(semester),
    }).populate('uploadedBy', 'fullName');

    if (existing) {
      const err = new AppError('A duplicate resource already exists for this department and semester.', 409);
      err.existingResource = {
        _id: existing._id,
        title: existing.title,
        uploadedBy: existing.uploadedBy,
      };
      throw err;
    }
  }

  // 4. Determine Cloudinary resource_type
  const cloudinaryResourceType = fileType === 'image' ? 'image' : 'raw';

  // 5. Upload file to Cloudinary
  const folder = `resources/${department || 'general'}/${year || 0}/${semester || 0}/${category || 'other'}`;
  const uploadResult = await uploadService.uploadFile(fileBuffer, folder, cloudinaryResourceType);

  // 6. Parse tags
  let parsedTags = [];
  if (tags) {
    parsedTags = Array.isArray(tags)
      ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
      : String(tags).split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  }

  // 7. Save resource to MongoDB — every field persisted
  const resource = await Resource.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    fileUrl: uploadResult.secure_url,
    fileType,
    publicId: uploadResult.public_id,
    subject: subject ? subject.trim() : '',
    department: department.trim(),
    year: year ? Number(year) : undefined,
    semester: semester ? Number(semester) : undefined,
    category: category || 'notes',
    uploadedBy: userId,
    tags: parsedTags,
    upvotes: [],
    qualityRating: 0,
    ratingCount: 0,
    ratedBy: [],
    downloadCount: 0,
    isExamPeriod: isExamPeriod === 'true' || isExamPeriod === true,
    fileHash,
    createdAt: new Date(),
  });

  // 8. Upsert ResourceIndex — add subject if not already in the list
  if (department && semester && subject) {
    await ResourceIndex.findOneAndUpdate(
      { department: department.trim(), semester: Number(semester) },
      { $addToSet: { subjects: subject.trim() } },
      { upsert: true, new: true }
    );
  }

  // 9. Create a feed Post (type: Resource) referencing this resource
  try {
    await Post.create({
      authorId: userId,
      content: `📚 New resource uploaded: **${title}** — ${subject || category}`,
      type: 'Resource',
      tags: parsedTags,
    });
  } catch (postErr) {
    logger.error(`Failed to create feed post for resource ${resource._id}: ${postErr.message}`);
  }

  // 10. Update uploader karma: +5
  try {
    const User = getUserModel();
    await User.findByIdAndUpdate(userId, { $inc: { karma: 5 } });
  } catch (karmaErr) {
    logger.error(`Failed to update karma for user ${userId}: ${karmaErr.message}`);
  }

  // 11. Emit Socket.io notification to users in same department+semester
  try {
    const room = `dept:${department}:sem:${semester}`;
    const notifMessage = `New ${subject || category} resource uploaded: "${title}"`;

    // Save notification to DB for all relevant users — broadcast to room
    if (io) {
      io.to(room).emit('new_resource', {
        resourceId: resource._id,
        title,
        subject: subject || '',
        category,
        uploadedBy: userId,
        message: notifMessage,
      });
    }

    // Save a global notification (no specific target userId — room-based)
    await Notification.create({
      userId: userId.toString(), // notifying the uploader of success
      type: 'resource_upload',
      message: notifMessage,
      metadata: { resourceId: resource._id, department, semester },
    });
  } catch (notifErr) {
    logger.error(`Failed to emit resource notification: ${notifErr.message}`);
  }

  return resource;
};

/**
 * GET /api/resources/:id
 * Get a single resource with uploader populated.
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
const getById = async (id) => {
  const resource = await Resource.findById(id).populate(
    'uploadedBy',
    'fullName avatar department year'
  );
  if (!resource) throw new AppError('Resource not found', 404);
  return resource;
};

/**
 * POST /api/resources/:id/vote
 * Toggle upvote. If adding: +1 karma to owner, send notification.
 *
 * @param {string}   id     — Resource _id
 * @param {ObjectId} userId — Voter's MongoDB _id
 * @param {Object}   io     — Socket.io instance
 * @returns {Promise<Object>} Updated resource
 */
const vote = async (id, userId, io) => {
  const resource = await Resource.findById(id);
  if (!resource) throw new AppError('Resource not found', 404);

  const alreadyVoted = resource.upvotes.some((uid) => uid.toString() === userId.toString());

  if (alreadyVoted) {
    // Remove vote
    resource.upvotes = resource.upvotes.filter((uid) => uid.toString() !== userId.toString());
  } else {
    // Add vote
    resource.upvotes.push(userId);

    // +1 karma to owner
    try {
      const User = getUserModel();
      await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { karma: 1 } });
    } catch (e) {
      logger.error(`Vote karma update failed: ${e.message}`);
    }

    // Notify resource owner
    if (resource.uploadedBy.toString() !== userId.toString()) {
      try {
        await Notification.create({
          userId: resource.uploadedBy.toString(),
          type: 'resource_upvote',
          message: `Someone upvoted your resource: "${resource.title}"`,
          metadata: { resourceId: resource._id },
        });

        if (io) {
          io.to(`user:${resource.uploadedBy}`).emit('notification', {
            type: 'resource_upvote',
            message: `Someone upvoted your resource: "${resource.title}"`,
          });
        }
      } catch (e) {
        logger.error(`Vote notification failed: ${e.message}`);
      }
    }
  }

  await resource.save();
  return resource;
};

/**
 * POST /api/resources/:id/rate
 * Rate a resource 1–5. One rating per user. Recomputes rolling average.
 *
 * @param {string}   id     — Resource _id
 * @param {ObjectId} userId — Rater's MongoDB _id
 * @param {number}   rating — 1-5
 * @returns {Promise<Object>} Updated resource
 */
const rate = async (id, userId, rating) => {
  const resource = await Resource.findById(id);
  if (!resource) throw new AppError('Resource not found', 404);

  const alreadyRated = resource.ratedBy.some((uid) => uid.toString() === userId.toString());
  if (alreadyRated) throw new AppError('You have already rated this resource', 400);

  // Recompute rolling average
  const newRatingCount = resource.ratingCount + 1;
  const newQualityRating =
    (resource.qualityRating * resource.ratingCount + rating) / newRatingCount;

  resource.qualityRating = Math.round(newQualityRating * 10) / 10; // round to 1 decimal
  resource.ratingCount = newRatingCount;
  resource.ratedBy.push(userId);

  await resource.save();
  return resource;
};

/**
 * POST /api/resources/:id/download
 * Increment download count. Emit milestone notifications. +2 karma every 10 downloads.
 *
 * @param {string}   id     — Resource _id
 * @param {ObjectId} userId — Downloader's MongoDB _id
 * @param {Object}   io     — Socket.io instance
 * @returns {Promise<{ downloadUrl: string }>}
 */
const incrementDownload = async (id, userId, io) => {
  const resource = await Resource.findByIdAndUpdate(
    id,
    { $inc: { downloadCount: 1 } },
    { new: true }
  );
  if (!resource) throw new AppError('Resource not found', 404);

  const count = resource.downloadCount;

  // Milestone notifications
  const milestones = [10, 50, 100];
  if (milestones.includes(count)) {
    try {
      await Notification.create({
        userId: resource.uploadedBy.toString(),
        type: 'resource_milestone',
        message: `Your resource "${resource.title}" has reached ${count} downloads! 🎉`,
        metadata: { resourceId: resource._id, milestone: count },
      });

      if (io) {
        io.to(`user:${resource.uploadedBy}`).emit('notification', {
          type: 'resource_milestone',
          message: `Your resource "${resource.title}" has reached ${count} downloads! 🎉`,
        });
      }
    } catch (e) {
      logger.error(`Milestone notification failed: ${e.message}`);
    }
  }

  // +2 karma to owner every 10 downloads
  if (count % 10 === 0) {
    try {
      const User = getUserModel();
      await User.findByIdAndUpdate(resource.uploadedBy, { $inc: { karma: 2 } });
    } catch (e) {
      logger.error(`Download karma update failed: ${e.message}`);
    }
  }

  return { downloadUrl: resource.fileUrl };
};

/**
 * DELETE /api/resources/:id
 * Owner or admin only. Deletes from Cloudinary, MongoDB, and feed.
 *
 * @param {string}   id     — Resource _id
 * @param {ObjectId} userId — Requester's MongoDB _id
 * @param {string}   role   — Requester's role
 * @returns {Promise<{ success: true }>}
 */
const remove = async (id, userId, role) => {
  const resource = await Resource.findById(id);
  if (!resource) throw new AppError('Resource not found', 404);

  const isOwner = resource.uploadedBy.toString() === userId.toString();
  const isAdmin = role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not authorized to delete this resource', 403);
  }

  // Delete from Cloudinary using saved publicId
  try {
    await uploadService.deleteFile(resource.publicId);
  } catch (e) {
    logger.error(`Cloudinary delete failed for ${resource.publicId}: ${e.message}`);
  }

  // Delete the associated feed post (Resource type, by this author)
  try {
    await Post.deleteOne({ authorId: resource.uploadedBy, type: 'Resource' });
  } catch (e) {
    logger.error(`Feed post delete failed: ${e.message}`);
  }

  // Delete the resource document
  await resource.deleteOne();

  return { success: true };
};

module.exports = {
  getAll,
  getSubjects,
  create,
  getById,
  vote,
  rate,
  incrementDownload,
  remove,
};
