const commentRepository = require('../repositories/comment.repository');
const postRepository = require('../repositories/post.repository');

// Helper: Error Factory
const throwError = (message, code, status = 400) => {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  throw error;
};

/**
 * Create a new comment
 * @param {Object} data 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const createComment = async (data, userId) => {
  // Validate post exists
  const post = await postRepository.findPostById(data.postId);
  if (!post) throwError('Post not found', 'POST_NOT_FOUND', 404);

  // Validate parent if provided
  if (data.parentId) {
    const parent = await commentRepository.findById(data.parentId);
    if (!parent) throwError('Parent comment not found', 'PARENT_NOT_FOUND', 404);
  }

  const commentData = {
    ...data,
    userId
  };

  const comment = await commentRepository.create(commentData);
  
  // Update post comment count
  await postRepository.incrementStats(data.postId, 'commentCount', 1);

  return comment;
};

/**
 * Get comment by ID
 * @param {string} id 
 * @param {boolean} includeChildren 
 * @returns {Promise<Object>}
 */
const getCommentById = async (id, includeChildren = false) => {
  let comment = await commentRepository.findById(id);
  if (!comment) throwError('Comment not found', 'COMMENT_NOT_FOUND', 404);

  if (includeChildren) {
    // Basic one-level fetch for "includeChildren"
    const children = await commentRepository.findReplies(id, { sort: { createdAt: 1 }, limit: 50 });
    comment = comment.toObject();
    comment.replies = children;
  }

  return comment;
};

/**
 * Update comment content
 * @param {string} id 
 * @param {string} content 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const updateComment = async (id, content, userId) => {
  const comment = await commentRepository.findById(id);
  if (!comment) throwError('Comment not found', 'COMMENT_NOT_FOUND', 404);

  if (comment.userId._id.toString() !== userId) {
    throwError('Unauthorized', 'FORBIDDEN', 403);
  }

  return commentRepository.update(id, {
    content,
    editedAt: new Date(),
    editedBy: userId
  });
};

/**
 * Soft delete comment
 * @param {string} id 
 * @param {string} userId 
 * @param {boolean} isAdmin 
 * @returns {Promise<Object>}
 */
const deleteComment = async (id, userId, isAdmin) => {
  const comment = await commentRepository.findById(id);
  if (!comment) throwError('Comment not found', 'COMMENT_NOT_FOUND', 404);

  if (comment.userId._id.toString() !== userId && !isAdmin) {
    throwError('Unauthorized', 'FORBIDDEN', 403);
  }

  const updated = await commentRepository.update(id, { status: 'deleted' });
  
  // Decrement post count
  await postRepository.incrementStats(comment.postId._id, 'commentCount', -1);
  
  return updated;
};

/**
 * Update status (Moderation)
 * @param {string} id 
 * @param {string} status 
 * @param {string} moderatorId 
 * @returns {Promise<Object>}
 */
const updateStatus = async (id, status, moderatorId) => {
  const allowed = ['pending', 'approved', 'rejected', 'deleted'];
  if (!allowed.includes(status)) throwError('Invalid status', 'INVALID_STATUS');

  return commentRepository.update(id, {
    status,
    editedAt: new Date(), // Track moderation time
    editedBy: moderatorId
  });
};

/**
 * Get comments for a post
 * @param {string} postId 
 * @param {Object} query { page, limit, sort, includeReplies }
 * @returns {Promise<Object>}
 */
const getPostComments = async (postId, query) => {
  const { page = 1, limit = 20, sort = 'new', includeReplies = 'false' } = query;
  
  // DEEP NESTING LOGIC (Revamped)
  if (includeReplies === 'inline' || includeReplies === 'true') {
    // 1. Fetch ALL approved comments for this post (up to a safety limit)
    // We need all of them to reconstruct the tree correctly.
    const allComments = await commentRepository.findMany(
      { postId, status: 'approved' }, 
      { sort: { createdAt: 1 }, limit: 2000 }
    );

    // 2. Convert to Objects and Create Map
    const commentMap = {};
    const roots = [];

    allComments.forEach(doc => {
      const comment = doc.toObject();
      comment.replies = []; // Initialize replies array
      commentMap[comment._id.toString()] = comment;
    });

    // 3. Build Tree by linking children to parents
    allComments.forEach(doc => {
      const comment = commentMap[doc._id.toString()];
      if (doc.parentId) {
        const parentIdStr = doc.parentId.toString();
        if (commentMap[parentIdStr]) {
          commentMap[parentIdStr].replies.push(comment);
        } else {
          // Parent might be deleted or not approved; handle orphans if needed
          // For now, strictly ignore or push to roots if you want to preserve content
        }
      } else {
        roots.push(comment);
      }
    });

    // 4. Sort Roots (and optionally replies if needed)
    if (sort === 'new') {
      roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'score') {
      roots.sort((a, b) => (b.votes?.score || 0) - (a.votes?.score || 0));
    }
    // (Replies are already roughly sorted by createdAt due to the initial fetch sort, 
    // but you could sort them recursively if strictly needed)

    // 5. Log nested structure as requested
    // console.log('[getPostComments] Nested Tree Structure:', JSON.stringify(roots, null, 2));

    // Return in the expected format
    return { 
      data: roots, 
      total: roots.length, 
      page: 1, 
      limit: roots.length 
    };
  }

  // FLAT LIST LOGIC (Default / Pagination)
  const filter = { postId, parentId: null, status: 'approved' };
  
  let sortOption = { createdAt: -1 }; // new
  if (sort === 'old') sortOption = { createdAt: 1 };
  else if (sort === 'score') sortOption = { 'votes.score': -1 };

  const skip = (page - 1) * limit;

  const comments = await commentRepository.findMany(filter, { sort: sortOption, skip, limit: parseInt(limit) });
  const total = await commentRepository.count(filter);

  return { data: comments, total, page, limit };
};

/**
 * Get replies for a comment
 * @param {string} commentId 
 * @param {Object} query 
 * @returns {Promise<Object>}
 */
const getReplies = async (commentId, query) => {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const replies = await commentRepository.findReplies(commentId, { sort: { createdAt: 1 }, skip, limit: parseInt(limit) });
  const total = await commentRepository.count({ parentId: commentId, status: 'approved' });

  return { data: replies, total, page, limit };
};

/**
 * Get Tree (Recursive/Nested)
 * @param {string} postId 
 * @param {Object} options 
 * @returns {Promise<Array>}
 */
const getCommentTree = async (postId, options) => {
  // For robust tree structures in Mongo, $graphLookup is best.
  // Reusing logic similar to category tree but filtered by post.
  // For this "low code" scope, fetching all and building in memory for small datasets is acceptable.
  
  const { maxDepth = 5, maxNodes = 1000, prune = false } = options;
  
  const filter = { postId };
  if (prune === 'true') filter.status = 'approved';

  const allComments = await commentRepository.findMany(filter, { sort: { createdAt: 1 }, limit: parseInt(maxNodes) });

  const buildTree = (parentId, depth) => {
    if (depth > maxDepth) return [];
    return allComments
      .filter(c => (c.parentId || null) == (parentId || null)) // Loose match for null/undefined
      .map(c => ({
        ...c.toObject(),
        replies: buildTree(c._id, depth + 1)
      }));
  };

  return buildTree(null, 1);
};

/**
 * Handle Voting
 * @param {string} id 
 * @param {string} userId 
 * @param {string} action 'upvote', 'downvote', 'remove'
 * @returns {Promise<Object>}
 */
const voteComment = async (id, userId, action) => {
  const comment = await commentRepository.findById(id);
  if (!comment) throwError('Comment not found', 'COMMENT_NOT_FOUND', 404);

  // Calculate score change manually to be precise
  // 1. Remove existing influence
  let score = comment.votes.score;
  const isUpvoted = comment.votes.upvotedBy.map(String).includes(String(userId));
  const isDownvoted = comment.votes.downvotedBy.map(String).includes(String(userId));

  if (isUpvoted) score -= 1;
  if (isDownvoted) score += 1;

  // 2. Apply new influence
  if (action === 'upvote') {
    await commentRepository.addVote(id, userId, 'upvote');
    score += 1;
  } else if (action === 'downvote') {
    await commentRepository.addVote(id, userId, 'downvote');
    score -= 1;
  } else if (action === 'remove') {
    await commentRepository.removeVote(id, userId);
  } else {
    throwError('Invalid action', 'INVALID_ACTION');
  }

  // 3. Update score
  return commentRepository.updateScore(id, score);
};

/**
 * Get Votes info
 * @param {string} id 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const getVotes = async (id, userId) => {
  const comment = await commentRepository.findById(id);
  if (!comment) throwError('Comment not found', 'COMMENT_NOT_FOUND', 404);

  let currentUserVote = null;
  if (userId) {
    if (comment.votes.upvotedBy.map(String).includes(String(userId))) currentUserVote = 'upvote';
    else if (comment.votes.downvotedBy.map(String).includes(String(userId))) currentUserVote = 'downvote';
  }

  return {
    score: comment.votes.score,
    currentUserVote
  };
};

/**
 * List comments (Admin/General)
 * @param {Object} query 
 * @returns {Promise<Object>}
 */
const listComments = async (query) => {
  const { page = 1, limit = 20, sort = 'new', status, postAuthorId } = query;
  
  const filter = {};
  if (status && status !== 'All') filter.status = status;

  if (postAuthorId) {
    // Find posts by this author to filter comments on them
    // Use a large limit to ensure we get all posts for the user
    const authorPosts = await postRepository.findPosts({ authorId: postAuthorId }, { limit: 10000, sort: { _id: 1 } });
    const postIds = authorPosts.map(p => p._id);
    
    if (postIds.length === 0) {
      return { data: [], total: 0, page, limit };
    }
    
    filter.postId = { $in: postIds };
  }
  
  let sortOption = { createdAt: -1 };
  if (sort === 'old') sortOption = { createdAt: 1 };
  
  const skip = (page - 1) * limit;

  const comments = await commentRepository.findMany(filter, { sort: sortOption, skip, limit: parseInt(limit) });
  const total = await commentRepository.count(filter);

  return { data: comments, total, page, limit };
};

module.exports = {
  createComment,
  getCommentById,
  updateComment,
  deleteComment,
  updateStatus,
  getPostComments,
  listComments,
  getReplies,
  getCommentTree,
  voteComment,
  getVotes
};
