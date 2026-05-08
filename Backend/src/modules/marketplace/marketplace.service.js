/** @file marketplace.service.js (scaffold) */
const Listing = require('./marketplace.model');

const create = async (data, email) => Listing.create({ ...data, seller: email });
const getAll = async (filters = {}) => {
  const query = { status: 'available' };
  if (filters.category) query.category = filters.category;
  if (filters.search) query.$text = { $search: filters.search };
  return Listing.find(query).sort({ createdAt: -1 }).limit(30);
};
const getById = async (id) => {
  const l = await Listing.findById(id);
  if (!l) { const e = new Error('Listing not found'); e.statusCode = 404; throw e; }
  return l;
};
const markSold = async (id, email, buyerEmail) => {
  const l = await Listing.findById(id);
  if (!l) { const e = new Error('Listing not found'); e.statusCode = 404; throw e; }
  if (l.seller !== email) { const e = new Error('Not authorized'); e.statusCode = 403; throw e; }
  l.status = 'sold';
  l.buyerEmail = buyerEmail || '';
  await l.save();
  return l;
};
const remove = async (id, email) => {
  const l = await Listing.findById(id);
  if (!l) { const e = new Error('Listing not found'); e.statusCode = 404; throw e; }
  if (l.seller !== email) { const e = new Error('Not authorized'); e.statusCode = 403; throw e; }
  await l.deleteOne();
  return { message: 'Listing deleted.' };
};

module.exports = { create, getAll, getById, markSold, remove };
