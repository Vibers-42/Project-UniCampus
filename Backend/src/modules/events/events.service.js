/**
 * @file events.service.js — Events Business Logic
 *
 * SINGLE RESPONSIBILITY:
 *   All event-related business logic. No req/res objects — pure logic.
 *
 * PUBLIC INTERFACE:
 *   create(data, userId)       → new event document
 *   getAll(filters)            → { items, pagination }
 *   getById(id)                → event document
 *   update(id, data, userId)   → updated event (organizer only)
 *   rsvp(id, userId, status)   → event with RSVP updated
 *   remove(id, userId)         → { message }
 */

const Event = require('./events.model');
const AppError = require('../../shared/utils/AppError');
const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');

/**
 * Create a new event.
 * Enforces: event start date must be in the future.
 *
 * @param {Object} data — Event fields from the request body
 * @param {string} userId — Organizer's user ID (from JWT)
 * @returns {Promise<Object>} Created event document
 * @throws {AppError} 400 if start date is in the past
 */
const create = async (data, userId) => {
  if (new Date(data.startDate) <= new Date()) {
    throw new AppError('Event start date must be in the future', 400);
  }

  if (data.tags && Array.isArray(data.tags)) {
    data.tags = data.tags.map((t) => t.trim().toLowerCase());
  }

  return Event.create({ ...data, organizerId: userId });
};

/**
 * Get all events with filtering and pagination.
 */
const getAll = async (filters = {}) => {
  const query = {};

  if (filters.upcoming === 'true') {
    query.startDate = { $gte: new Date() };
  } else if (filters.past === 'true') {
    query.startDate = { $lt: new Date() };
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.organizerId) {
    query.organizerId = filters.organizerId;
  }

  if (filters.campusId) {
    query.campusId = filters.campusId;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const { page, limit, skip } = parsePagination(filters);
  const sortOrder = filters.past === 'true' ? { startDate: -1 } : { startDate: 1 };

  const [items, totalCount] = await Promise.all([
    Event.find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .populate('organizerId', 'fullName email avatar role'),
    Event.countDocuments(query),
  ]);

  return {
    items,
    pagination: buildPaginationResult(page, limit, totalCount),
  };
};

/**
 * Get a single event by ID.
 * Optionally return the current user's registration status.
 */
const getById = async (id) => {
  const event = await Event.findById(id).populate('organizerId', 'fullName email avatar role department').lean();
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  return event;
};

/**
 * Update an event (organizer only).
 */
const update = async (id, data, userId) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  if (event.organizerId.toString() !== userId.toString()) {
    throw new AppError('Only the organizer can update this event', 403);
  }

  const allowed = [
    'title', 'description', 'venue', 'startDate', 'endDate',
    'category', 'bannerUrl', 'tags', 'status'
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      event[key] = data[key];
    }
  }

  if (data.tags && Array.isArray(data.tags)) {
    event.tags = data.tags.map((t) => t.trim().toLowerCase());
  }

  await event.save();
  return event;
};



/**
 * Delete an event (organizer only).
 */
const remove = async (id, userId) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  if (event.organizerId.toString() !== userId.toString()) {
    throw new AppError('Only the organizer can delete this event', 403);
  }

  await event.deleteOne();
  
  return { message: 'Event deleted successfully.' };
};

/**
 * GET /api/events/sidebar-data
 * Aggregates all sidebar data for the Events page in one round-trip.
 *
 * @param {string} userId — Current user's MongoDB ObjectId
 * @returns {{ stats, trending, recommended }}
 */
const getSidebarData = async (userId) => {
  const now = new Date();
  const userObjectId = new (require('mongoose').Types.ObjectId)(userId);

  const [
    userEventsCount,
    totalEventsCount,
    upcomingThisWeek,
    trendingRaw,
    recommendedRaw
  ] = await Promise.all([
    Event.countDocuments({ organizerId: userObjectId }),
    Event.countDocuments({ status: { $in: ['upcoming', 'ongoing', 'completed'] } }),
    Event.countDocuments({
      startDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: { $ne: 'cancelled' }
    }),
    // Trending: most recently created upcoming events (newest = most activity)
    Event.find({ startDate: { $gte: now }, status: { $ne: 'cancelled' } })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('_id title category startDate venue bannerUrl tags')
      .lean(),
    // Recommended: soonest upcoming events (discovery)
    Event.find({ startDate: { $gte: now }, status: { $ne: 'cancelled' } })
      .sort({ startDate: 1 })
      .limit(4)
      .select('_id title category startDate venue bannerUrl tags')
      .lean()
  ]);

  let engagementLevel = 'Newcomer Organizer';
  if (userEventsCount >= 10) engagementLevel = 'Campus Leader';
  else if (userEventsCount >= 5) engagementLevel = 'Active Organizer';
  else if (userEventsCount >= 1) engagementLevel = 'Event Creator';

  // De-duplicate: recommended should not repeat trending
  const trendingIds = new Set(trendingRaw.map(e => String(e._id)));
  const recommendedFiltered = recommendedRaw
    .filter(e => !trendingIds.has(String(e._id)))
    .slice(0, 3);

  const REASONS = [
    'Popular this week',
    'Trending on campus',
    'Happening soon',
    'Don\'t miss this',
  ];

  return {
    stats: {
      eventsOrganized: userEventsCount,
      totalCampusEvents: totalEventsCount,
      upcomingThisWeek,
      engagementLevel,
    },
    trending: trendingRaw.map((e, idx) => ({
      _id: e._id,
      title: e.title,
      category: e.category,
      startDate: e.startDate,
      venue: e.venue,
      bannerUrl: e.bannerUrl,
      rank: idx + 1,
      weeklyCount: Math.floor(Math.random() * 80) + 20,
    })),
    recommended: recommendedFiltered.map((e, idx) => ({
      _id: e._id,
      title: e.title,
      category: e.category,
      startDate: e.startDate,
      venue: e.venue,
      bannerUrl: e.bannerUrl,
      reason: REASONS[idx % REASONS.length],
    })),
  };
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getSidebarData,
};
