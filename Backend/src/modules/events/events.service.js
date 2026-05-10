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
const EventRegistration = require('./eventRegistration.model');
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
 */
const getById = async (id) => {
  const event = await Event.findById(id).populate('organizerId', 'fullName email avatar role department');
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
    'registrationDeadline', 'category', 'registrationLink', 'bannerUrl', 'maxParticipants', 'tags', 'status'
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
 * RSVP to an event.
 *
 * @param {string} id — Event ID
 * @param {string} userId — User's ID
 * @param {string} status - 'interested' | 'registered'
 */
const rsvp = async (id, userId, status = 'registered') => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.startDate < new Date()) {
    throw new AppError('Cannot RSVP to a past event', 400);
  }

  if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
    throw new AppError('Registration deadline has passed', 400);
  }

  let registration = await EventRegistration.findOne({ eventId: id, userId });

  if (registration) {
    // If same status, cancel it (toggle off)
    if (registration.status === status) {
      await registration.deleteOne();
      
      // Update counters
      if (status === 'registered') event.registeredCount = Math.max(0, event.registeredCount - 1);
      if (status === 'interested') event.interestedCount = Math.max(0, event.interestedCount - 1);
      await event.save();
      
      return { event, action: 'cancelled' };
    }
    
    // Otherwise update status
    const oldStatus = registration.status;
    registration.status = status;
    await registration.save();
    
    if (oldStatus === 'registered' && status === 'interested') {
      event.registeredCount = Math.max(0, event.registeredCount - 1);
      event.interestedCount += 1;
    } else if (oldStatus === 'interested' && status === 'registered') {
      if (event.maxParticipants > 0 && event.registeredCount >= event.maxParticipants) {
        throw new AppError('Event is at full capacity', 400);
      }
      event.interestedCount = Math.max(0, event.interestedCount - 1);
      event.registeredCount += 1;
    }
    await event.save();
    return { event, action: 'updated', status };
  }

  // New RSVP
  if (status === 'registered' && event.maxParticipants > 0 && event.registeredCount >= event.maxParticipants) {
    throw new AppError('Event is at full capacity', 400);
  }

  await EventRegistration.create({ eventId: id, userId, status });
  
  if (status === 'registered') event.registeredCount += 1;
  if (status === 'interested') event.interestedCount += 1;
  await event.save();

  return { event, action: 'confirmed', status };
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
  // also cleanup registrations
  await EventRegistration.deleteMany({ eventId: id });
  
  return { message: 'Event deleted successfully.' };
};

/**
 * GET /api/events/sidebar-data
 * Aggregates all sidebar data for the Events page in one round-trip.
 *
 * @param {string} userId — Current user's MongoDB ObjectId
 * @returns {{ stats, upcoming, trending, pulse }}
 */
const getSidebarData = async (userId) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const userObjectId = new (require('mongoose').Types.ObjectId)(userId);

    // Run all queries in parallel for performance
  const [
    userRegistrations,
    upcomingRegistrations,
    trendingEvents,
  ] = await Promise.all([
    // 1. All user registrations (for stats and yourRegistrations)
    EventRegistration.find({ userId: userObjectId })
      .populate('eventId', 'category title status startDate venue bannerUrl')
      .lean(),

    // 2. User's next 3 upcoming registered events
    EventRegistration.find({ userId: userObjectId, status: 'registered' })
      .populate({
        path: 'eventId',
        match: { startDate: { $gte: now }, status: { $ne: 'cancelled' } },
        select: 'title category startDate venue registeredCount status',
      })
      .lean()
      .then((regs) =>
        regs
          .filter((r) => r.eventId) // remove nulls (match filtered them out)
          .sort((a, b) => a.eventId.startDate - b.eventId.startDate)
          .slice(0, 3)
      ),

    // 3. Top 3 trending events this week by registeredCount
    EventRegistration.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$eventId', weeklyCount: { $sum: 1 } } },
      { $sort: { weeklyCount: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      {
        $project: {
          _id: 0,
          eventId: '$_id',
          weeklyCount: 1,
          title: '$event.title',
          category: '$event.category',
          registeredCount: '$event.registeredCount',
          startDate: '$event.startDate',
        },
      },
    ]),

    ]),
  ]);

  // ── Build Stats & Categories ──
  const categoryMap = {};
  const userEventIds = [];
  userRegistrations.forEach((reg) => {
    if (!reg.eventId) return;
    userEventIds.push(reg.eventId._id || reg.eventId);
    const cat = reg.eventId.category;
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const eventsJoined = userRegistrations.length;
  const workshopsAttended = categoryMap['workshop'] || 0;
  const hackathonsParticipated = categoryMap['hackathon'] || 0;
  const certificatesEarned = userRegistrations.filter(
    (r) => r.eventId && ['workshop', 'hackathon', 'seminar'].includes(r.eventId.category) && r.eventId.status === 'completed'
  ).length;

  let engagementLevel = 'Newcomer';
  if (eventsJoined >= 10) engagementLevel = 'Campus Leader';
  else if (eventsJoined >= 6) engagementLevel = 'Active Participant';
  else if (eventsJoined >= 3) engagementLevel = 'Rising Star';
  else if (eventsJoined >= 1) engagementLevel = 'Explorer';

  // ── Recommended Events ──
  // Sort user's top categories
  const sortedCategories = Object.keys(categoryMap).sort((a, b) => categoryMap[b] - categoryMap[a]);
  let recommendedEvents = [];
  
  if (sortedCategories.length > 0) {
    // Find upcoming events in top categories that user hasn't joined
    recommendedEvents = await Event.find({
      _id: { $nin: userEventIds },
      category: { $in: sortedCategories },
      startDate: { $gte: now },
      status: { $ne: 'cancelled' },
    })
      .sort({ startDate: 1 })
      .limit(3)
      .select('title category startDate venue registeredCount maxParticipants status bannerUrl')
      .lean();
  }

  // Fallback if not enough recommendations
  if (recommendedEvents.length < 3) {
    const existingRecIds = recommendedEvents.map(e => e._id);
    const fallbackEvents = await Event.find({
      _id: { $nin: [...userEventIds, ...existingRecIds] },
      startDate: { $gte: now },
      status: { $ne: 'cancelled' },
    })
      .sort({ registeredCount: -1, interestedCount: -1 }) // trending globally
      .limit(3 - recommendedEvents.length)
      .select('title category startDate venue registeredCount maxParticipants status bannerUrl')
      .lean();
    
    recommendedEvents = [...recommendedEvents, ...fallbackEvents];
  }

  // ── Build Your Registrations Summary ──
  const registeredOnly = userRegistrations.filter((r) => r.status === 'registered' && r.eventId);
  const totalRegistrations = registeredOnly.length;
  
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingThisWeek = registeredOnly.filter((r) => 
    r.eventId.startDate >= now && r.eventId.startDate <= nextWeek
  ).length;

  const completedEvents = registeredOnly.filter((r) => r.eventId.status === 'completed').length;
  
  // Pending approvals might map to 'interested' status or waitlist in the future
  const pendingApprovals = userRegistrations.filter((r) => r.status === 'interested').length;

  // Find the latest registered event by registration createdAt
  let latestEvent = null;
  if (registeredOnly.length > 0) {
    const sortedRegs = [...registeredOnly].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    latestEvent = sortedRegs[0].eventId;
  }

  return {
    stats: {
      eventsJoined,
      workshopsAttended,
      hackathonsParticipated,
      certificatesEarned,
      engagementLevel,
    },
    upcoming: upcomingRegistrations.map((r) => ({
      registrationId: r._id,
      status: r.status,
      event: r.eventId,
    })),
    trending: trendingEvents,
    yourRegistrations: {
      total: totalRegistrations,
      upcomingThisWeek,
      completed: completedEvents,
      pending: pendingApprovals,
      latestEvent,
    },
    recommended: recommendedEvents.map(e => ({
      ...e,
      reason: sortedCategories.includes(e.category) 
        ? `Based on your interest in ${e.category}`
        : 'Trending on campus'
    })),
  };
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  rsvp,
  remove,
  getSidebarData,
};
