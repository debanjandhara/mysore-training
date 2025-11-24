const Comment = require('../models/comment.model');

/**
 * Create a new comment
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const create = (data) => {
  return Comment.create(data);
};

/**
 * Find comment by ID
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const findById = (id) => {
  return Comment.findById(id)
    .populate('userId', 'name username profileImage')
    .populate('postId', 'title slug');
};

/**
 * Update comment by ID
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
const update = (id, updateData) => {
  return Comment.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Find comments with filters
 * @param {Object} filter 
 * @param {Object} options { sort, skip, limit }
 * @returns {Promise<Array>}
 */
const findMany = (filter, options) => {
  return Comment.find(filter)
    .sort(options.sort)
    .skip(options.skip)
    .limit(options.limit)
    .populate('userId', 'name username profileImage')
    .populate('postId', 'title slug');
};

/**
 * Count comments
 * @param {Object} filter 
 * @returns {Promise<number>}
 */
const count = (filter) => {
  return Comment.countDocuments(filter);
};

/**
 * Add vote to comment
 * @param {string} id 
 * @param {string} userId 
 * @param {string} type 'upvote' or 'downvote'
 * @returns {Promise<Object>}
 */
const addVote = async (id, userId, type) => {
  const pullQuery = {
    $pull: { 
      'votes.upvotedBy': userId,
      'votes.downvotedBy': userId 
    }
  };
  
  // First remove any existing vote
  await Comment.findByIdAndUpdate(id, pullQuery);

  // Then add new vote and update score
  const pushQuery = {
    $addToSet: { [`votes.${type}dBy`]: userId }
  };
  
  // Note: Score update logic handled here or in service. 
  // Simple increment/decrement is tricky without known previous state in one go.
  // We'll do atomic push here, and recalculate score or use $inc logic in service if needed.
  // For atomic accuracy, we often need two steps or complex pipeline.
  // To keep it simple per prompt "Low-code", we will let service handle logic and just expose atomic ops.
  
  return Comment.findByIdAndUpdate(id, pushQuery, { new: true });
};

/**
 * Remove vote from comment
 * @param {string} id 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const removeVote = (id, userId) => {
  return Comment.findByIdAndUpdate(id, {
    $pull: { 
      'votes.upvotedBy': userId,
      'votes.downvotedBy': userId 
    }
  }, { new: true });
};

/**
 * Update vote score directly
 * @param {string} id 
 * @param {number} score 
 * @returns {Promise<Object>}
 */
const updateScore = (id, score) => {
  return Comment.findByIdAndUpdate(id, { 'votes.score': score }, { new: true });
};

/**
 * Find replies (children)
 * @param {string} parentId 
 * @param {Object} options 
 * @returns {Promise<Array>}
 */
const findReplies = (parentId, options) => {
  return Comment.find({ parentId, status: 'approved' })
    .sort(options.sort)
    .skip(options.skip)
    .limit(options.limit)
    .populate('userId', 'name username profileImage');
};

module.exports = {
  create,
  findById,
  update,
  findMany,
  count,
  addVote,
  removeVote,
  updateScore,
  findReplies
};
