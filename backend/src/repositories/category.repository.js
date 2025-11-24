const Category = require('../models/category.model');
const mongoose = require('mongoose');

/**
 * Find category by ID
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const findById = (id) => {
  return Category.findOne({ _id: id, deletedAt: null });
};

/**
 * Find category by ID or Slug
 * @param {string} identifier 
 * @returns {Promise<Object>}
 */
const findByIdOrSlug = (identifier) => {
  const query = mongoose.isValidObjectId(identifier) 
    ? { _id: identifier } 
    : { slug: identifier };
  return Category.findOne({ ...query, deletedAt: null });
};

/**
 * Find category by slug
 * @param {string} slug 
 * @returns {Promise<Object>}
 */
const findBySlug = (slug) => {
  return Category.findOne({ slug, deletedAt: null });
};

/**
 * Create new category
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const create = (data) => {
  return Category.create(data);
};

/**
 * Update category
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
const update = (id, updateData) => {
  return Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Soft delete category
 * @param {string} id 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const softDelete = (id, userId) => {
  return Category.findByIdAndUpdate(
    id, 
    { deletedAt: new Date(), deletedBy: userId }, 
    { new: true }
  );
};

/**
 * Hard delete category
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const hardDelete = (id) => {
  return Category.findByIdAndDelete(id);
};

/**
 * Find children of a category
 * @param {string} parentId 
 * @returns {Promise<Array>}
 */
const findChildren = (parentId) => {
  return Category.find({ parentCategoryId: parentId, deletedAt: null });
};

/**
 * List categories with filters
 * @param {Object} query 
 * @param {Object} options 
 * @returns {Promise<Array>}
 */
const list = async (filter, options) => {
  const { sort, limit, skip } = options;
  return Category.find({ ...filter, deletedAt: null })
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

/**
 * Count categories with filters
 * @param {Object} filter 
 * @returns {Promise<number>}
 */
const count = (filter) => {
  return Category.countDocuments({ ...filter, deletedAt: null });
};

/**
 * Get ancestors (aggregation)
 * @param {string} id 
 * @returns {Promise<Array>}
 */
const getAncestors = async (id) => {
  return Category.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$parentCategoryId',
        connectFromField: 'parentCategoryId',
        connectToField: '_id',
        as: 'ancestors',
        depthField: 'level'
      }
    },
    { $unwind: '$ancestors' },
    { $replaceRoot: { newRoot: '$ancestors' } },
    { $match: { deletedAt: null } },
    { $sort: { level: 1 } }
  ]);
};

/**
 * Get descendants (aggregation)
 * @param {string} id 
 * @returns {Promise<Array>}
 */
const getDescendants = async (id) => {
  return Category.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentCategoryId',
        as: 'descendants',
        depthField: 'level'
      }
    },
    { $unwind: '$descendants' },
    { $replaceRoot: { newRoot: '$descendants' } },
    { $match: { deletedAt: null } },
    { $sort: { level: 1 } }
  ]);
};

/**
 * Get category tree
 * @param {number} maxDepth 
 * @param {boolean} excludeDeleted 
 * @returns {Promise<Array>}
 */
const getTree = async (maxDepth, excludeDeleted) => {
  // Simplified tree fetching: fetch all and build in service or use graphLookup from root
  // For minimal db load, fetching all valid categories is often faster than recursive lookups for small datasets (<10k)
  const filter = excludeDeleted ? { deletedAt: null } : {};
  return Category.find(filter).lean();
};

module.exports = {
  findById,
  findByIdOrSlug,
  findBySlug,
  create,
  update,
  softDelete,
  hardDelete,
  findChildren,
  list,
  count,
  getAncestors,
  getDescendants,
  getTree
};
