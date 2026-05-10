const MarketplaceItem = require('./marketplace.model');
const AppError = require('../../shared/utils/AppError');

/**
 * Get all marketplace items with filtering and search
 */
const getAll = async (queryParams) => {
  const { category, search, page = 1, limit = 20 } = queryParams;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  if (category) query.category = category;
  if (search) {
    query.$text = { $search: search };
  }

  const items = await MarketplaceItem.find(query)
    .populate('sellerId', 'fullName avatar rollNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MarketplaceItem.countDocuments(query);

  return {
    items,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit)
  };
};

/**
 * Get single item by ID
 */
const getById = async (id) => {
  const item = await MarketplaceItem.findById(id).populate('sellerId', 'fullName avatar rollNumber role');
  if (!item || item.isDeleted) {
    throw new AppError('Item not found', 404);
  }
  return item;
};

/**
 * Create a new listing
 */
const create = async (data, userId) => {
  return await MarketplaceItem.create({
    ...data,
    sellerId: userId
  });
};

/**
 * Delete a listing (soft delete)
 */
const remove = async (id, userId, userRole) => {
  const item = await MarketplaceItem.findById(id);
  
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Only owner or admin can delete
  if (item.sellerId.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('Not authorized to delete this listing', 403);
  }

  item.isDeleted = true;
  await item.save();
  return item;
};

/**
 * Mark item as sold
 */
const markSold = async (id, userId) => {
  const item = await MarketplaceItem.findById(id);
  
  if (!item) {
    throw new AppError('Item not found', 404);
  }

  if (item.sellerId.toString() !== userId.toString()) {
    throw new AppError('Only the seller can mark this item as sold', 403);
  }

  item.isSold = !item.isSold;
  await item.save();
  return item;
};

module.exports = {
  getAll,
  getById,
  create,
  remove,
  markSold
};
