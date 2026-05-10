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

module.exports = {
  create,
  getAll,
  getById,
  update,
  rsvp,
  remove,
};
