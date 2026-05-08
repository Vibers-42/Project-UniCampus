/**
 * @file events.service.js — Events Business Logic
 *
 * SINGLE RESPONSIBILITY:
 *   All event-related business logic. No req/res objects — pure logic.
 *
 * PUBLIC INTERFACE:
 *   create(data, email)       → new event document
 *   getAll(filters)           → { items, pagination }
 *   getById(id)               → event document
 *   update(id, data, email)   → updated event (organiser only)
 *   rsvp(id, email)           → event with RSVP toggled
 *   cancelRsvp(id, email)     → event with RSVP removed
 *   remove(id, email)         → { message }
 *
 * BUSINESS RULES:
 *   - Events must have a future date on creation
 *   - RSVP respects maxCapacity (0 = unlimited)
 *   - Only the organiser can update/delete an event
 *   - Past events can still be viewed and listed
 */

const Event = require('./events.model');
const AppError = require('../../shared/utils/AppError');
const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');

/**
 * Create a new event.
 * Enforces: event date must be in the future.
 *
 * @param {Object} data — Event fields from the request body
 * @param {string} email — Organiser's email (from JWT)
 * @returns {Promise<Object>} Created event document
 * @throws {AppError} 400 if date is in the past
 */
const create = async (data, email) => {
  // Enforce future-only dates on creation
  if (new Date(data.date) <= new Date()) {
    throw new AppError('Event date must be in the future', 400);
  }

  // Normalize tags
  if (data.tags && Array.isArray(data.tags)) {
    data.tags = data.tags.map((t) => t.trim().toLowerCase());
  }

  return Event.create({ ...data, organiser: email });
};

/**
 * Get all events with filtering and pagination.
 *
 * Supported filters:
 *   ?upcoming=true          — Only future events (date >= now)
 *   ?past=true              — Only past events (date < now)
 *   ?category=hackathon     — Filter by category
 *   ?organiser=email        — Filter by organiser
 *   ?search=react           — Full-text search across title + description
 *   ?page=1&limit=20        — Pagination
 *
 * Default sort: by date ascending (nearest events first).
 *
 * @param {Object} filters — Query params
 * @returns {Promise<{ items: Array, pagination: Object }>}
 */
const getAll = async (filters = {}) => {
  const query = {};

  // Time-based filters
  if (filters.upcoming === 'true') {
    query.date = { $gte: new Date() };
  } else if (filters.past === 'true') {
    query.date = { $lt: new Date() };
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.organiser) {
    query.organiser = filters.organiser;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const { page, limit, skip } = parsePagination(filters);

  // Default sort: upcoming events first (ascending by date)
  const sortOrder = filters.past === 'true' ? { date: -1 } : { date: 1 };

  const [items, totalCount] = await Promise.all([
    Event.find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit)
      .select('-rsvpList'), // Don't send full RSVP list in list view
    Event.countDocuments(query),
  ]);

  return {
    items,
    pagination: buildPaginationResult(page, limit, totalCount),
  };
};

/**
 * Get a single event by ID (includes full rsvpList).
 *
 * @param {string} id — Event MongoDB _id
 * @returns {Promise<Object>} Event document
 * @throws {AppError} 404 if not found
 */
const getById = async (id) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  return event;
};

/**
 * Update an event (organiser only).
 *
 * @param {string} id — Event MongoDB _id
 * @param {Object} data — Fields to update
 * @param {string} email — Requester's email (must match organiser)
 * @returns {Promise<Object>} Updated event document
 * @throws {AppError} 404 if not found, 403 if not organiser
 */
const update = async (id, data, email) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  if (event.organiser !== email) {
    throw new AppError('Only the organiser can update this event', 403);
  }

  // Whitelist updatable fields
  const allowed = [
    'title', 'description', 'venue', 'date', 'endDate',
    'category', 'registrationLink', 'bannerUrl', 'maxCapacity', 'tags',
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      event[key] = data[key];
    }
  }

  // Normalize tags on update
  if (data.tags && Array.isArray(data.tags)) {
    event.tags = data.tags.map((t) => t.trim().toLowerCase());
  }

  await event.save();
  return event;
};

/**
 * RSVP to an event (toggle — add if not present, remove if already RSVPed).
 *
 * @param {string} id — Event MongoDB _id
 * @param {string} email — User's email (from JWT)
 * @returns {Promise<Object>} Updated event
 * @throws {AppError} 404 if not found, 400 if event is in the past, 400 if at capacity
 */
const rsvp = async (id, email) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.date < new Date()) {
    throw new AppError('Cannot RSVP to a past event', 400);
  }

  const idx = event.rsvpList.indexOf(email);

  if (idx !== -1) {
    // Already RSVPed → cancel RSVP
    event.rsvpList.splice(idx, 1);
    await event.save();
    return { event, action: 'cancelled' };
  }

  // New RSVP — check capacity
  if (event.maxCapacity > 0 && event.rsvpList.length >= event.maxCapacity) {
    throw new AppError('Event is at full capacity', 400);
  }

  event.rsvpList.push(email);
  await event.save();
  return { event, action: 'confirmed' };
};

/**
 * Delete an event (organiser only).
 *
 * @param {string} id — Event MongoDB _id
 * @param {string} email — Requester's email (must match organiser)
 * @returns {Promise<{ message: string }>}
 * @throws {AppError} 404 if not found, 403 if not organiser
 */
const remove = async (id, email) => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  if (event.organiser !== email) {
    throw new AppError('Only the organiser can delete this event', 403);
  }

  await event.deleteOne();
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
