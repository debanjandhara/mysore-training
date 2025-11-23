const Post = require('../models/post.model');

/**
 * Create a new post
 * @param {Object} postData 
 * @returns {Promise<Object>}
 */
const createPost = (postData) => {
  return Post.create(postData);
};

/**
 * Find post by ID
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const findPostById = (id) => {
  return Post.findOne({ _id: id, deletedAt: null })
    .populate('authorId', 'name email username profileImage')
    .populate('categoryIds', 'name slug')
    .populate('tagIds', 'name slug');
};

/**
 * Find post by Slug
 * @param {string} slug 
 * @returns {Promise<Object>}
 */
const findPostBySlug = (slug) => {
  return Post.findOne({ slug, deletedAt: null })
    .populate('authorId', 'name email username profileImage')
    .populate('categoryIds', 'name slug')
    .populate('tagIds', 'name slug');
};

/**
 * Update post by ID
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
const updatePost = (id, updateData) => {
  return Post.findOneAndUpdate({ _id: id, deletedAt: null }, updateData, { new: true, runValidators: true });
};

/**
 * Soft delete post
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const softDeletePost = (id) => {
  return Post.findOneAndUpdate({ _id: id }, { deletedAt: new Date() }, { new: true });
};

/**
 * Hard delete post
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const hardDeletePost = (id) => {
  return Post.findByIdAndDelete(id);
};

/**
 * Find posts with filters
 * @param {Object} filter 
 * @param {Object} options { skip, limit, sort }
 * @returns {Promise<Array>}
 */
const findPosts = (filter, options) => {
  return Post.find({ ...filter, deletedAt: null })
    .sort(options.sort)
    .skip(options.skip)
    .limit(options.limit)
    .populate('authorId', 'name username')
    .populate('categoryIds', 'name slug')
    .populate('tagIds', 'name slug');
};

/**
 * Count posts matching filter
 * @param {Object} filter 
 * @returns {Promise<number>}
 */
const countPosts = (filter) => {
  return Post.countDocuments({ ...filter, deletedAt: null });
};

/**
 * Increment post stats atomically
 * @param {string} id 
 * @param {string} field 
 * @param {number} value 
 * @returns {Promise<Object>}
 */
const incrementStats = (id, field, value = 1) => {
  return Post.findByIdAndUpdate(id, { $inc: { [`cachedStats.${field}`]: value } }, { new: true });
};

/**
 * Search posts (Text Search)
 * @param {string} query 
 * @param {Object} options 
 * @returns {Promise<Array>}
 */
const searchPosts = (query, options) => {
  return Post.find(
    { $text: { $search: query }, status: 'published', deletedAt: null },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .skip(options.skip)
    .limit(options.limit);
};

module.exports = {
  createPost,
  findPostById,
  findPostBySlug,
  updatePost,
  softDeletePost,
  hardDeletePost,
  findPosts,
  countPosts,
  incrementStats,
  searchPosts
};
