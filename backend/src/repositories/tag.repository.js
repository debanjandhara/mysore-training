const Tag = require('../models/tag.model');

/**
 * Find tag by ID
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const findById = (id) => {
  return Tag.findOne({ _id: id, deletedAt: null });
};

/**
 * Find tag by slug
 * @param {string} slug 
 * @returns {Promise<Object>}
 */
const findBySlug = (slug) => {
  return Tag.findOne({ slug, deletedAt: null });
};

/**
 * Create new tag
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const create = (data) => {
  return Tag.create(data);
};

/**
 * Update tag
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
const update = (id, updateData) => {
  return Tag.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Soft delete tag
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const softDelete = (id) => {
  return Tag.findByIdAndUpdate(
    id, 
    { deletedAt: new Date() }, 
    { new: true }
  );
};

/**
 * Hard delete tag
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const hardDelete = (id) => {
  return Tag.findByIdAndDelete(id);
};

/**
 * List tags
 * @param {Object} filter 
 * @param {Object} options 
 * @returns {Promise<Array>}
 */
const list = (filter, options) => {
  const { sort, limit, skip } = options;
  return Tag.find({ ...filter, deletedAt: null })
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

/**
 * Count tags
 * @param {Object} filter 
 * @returns {Promise<number>}
 */
const count = (filter) => {
  return Tag.countDocuments({ ...filter, deletedAt: null });
};

/**
 * Search tags (Autocomplete)
 * @param {string} query 
 * @returns {Promise<Array>}
 */
const search = (query) => {
  return Tag.find(
    { 
      name: { $regex: query, $options: 'i' }, 
      deletedAt: null 
    },
    { name: 1, slug: 1 }
  ).limit(10);
};

module.exports = {
  findById,
  findBySlug,
  create,
  update,
  softDelete,
  hardDelete,
  list,
  count,
  search
};
