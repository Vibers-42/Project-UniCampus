const Opportunity = require('./opportunities.model');
const AppError = require('../../shared/utils/AppError');
const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');

const create = async (data, userId) => {
  const opportunity = await Opportunity.create({ ...data, postedBy: userId });
  return opportunity.populate('postedBy', 'fullName avatar role badges');
};

const getAll = async (filters = {}) => {
  const query = {};
  
  if (filters.type && filters.type !== 'All') {
    query.type = filters.type;
  }
  
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  const { page, limit, skip } = parsePagination(filters);
  const [items, totalCount] = await Promise.all([
    Opportunity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('postedBy', 'fullName avatar role badges'),
    Opportunity.countDocuments(query)
  ]);
  
  return { items, pagination: buildPaginationResult(page, limit, totalCount) };
};

const getById = async (id) => {
  const opportunity = await Opportunity.findById(id).populate('postedBy', 'fullName avatar role badges');
  if (!opportunity) throw new AppError('Opportunity not found', 404);
  return opportunity;
};

const remove = async (id, userId, userRole) => {
  const opportunity = await Opportunity.findById(id);
  if (!opportunity) throw new AppError('Opportunity not found', 404);
  
  if (opportunity.postedBy.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('Not authorized to delete this opportunity', 403);
  }
  
  await opportunity.deleteOne();
  return { message: 'Opportunity deleted successfully' };
};

module.exports = { create, getAll, getById, remove };
