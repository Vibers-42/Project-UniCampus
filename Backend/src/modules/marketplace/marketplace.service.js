/** @file marketplace.service.js (scaffold) */
const Listing = require('./marketplace.model');
const AppError = require('../../shared/utils/AppError');
const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');

const create = async (data, email) => Listing.create({ ...data, seller: email });
const getAll = async (filters = {}) => {
  const query = { status: 'available' };
  if (filters.category) query.category = filters.category;
  if (filters.search) query.$text = { $search: filters.search };
  const { page, limit, skip } = parsePagination(filters);
  const [items, totalCount] = await Promise.all([
    Listing.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Listing.countDocuments(query),
  ]);
  return { items, pagination: buildPaginationResult(page, limit, totalCount) };
};
const getById = async (id) => {
  const l = await Listing.findById(id);
  if (!l) throw new AppError('Listing not found', 404);
  return l;
};
const markSold = async (id, email, buyerEmail) => {
  const l = await Listing.findById(id);
  if (!l) throw new AppError('Listing not found', 404);
  if (l.seller !== email) throw new AppError('Not authorized', 403);
  l.status = 'sold';
  l.buyerEmail = buyerEmail || '';
  await l.save();
  return l;
};
const remove = async (id, email) => {
  const l = await Listing.findById(id);
  if (!l) throw new AppError('Listing not found', 404);
  if (l.seller !== email) throw new AppError('Not authorized', 403);
  await l.deleteOne();
  return { message: 'Listing deleted.' };
};

module.exports = { create, getAll, getById, markSold, remove };
