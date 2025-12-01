const postRepository = require('../repositories/post.repository');

// Helper: Error Factory
const throwError = (message, code, status = 400) => {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  throw error;
};

/**
 * Generate unique slug
 * @param {string} title 
 * @param {string} [currentId] 
 * @returns {Promise<string>}
 */
const generateSlug = async (title, currentId = null) => {
  let slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  let uniqueSlug = slug;
  let counter = 1;
  
  while (true) {
    const existing = await postRepository.findPostBySlug(uniqueSlug);
    if (!existing || (currentId && existing._id.toString() === currentId.toString())) {
      return uniqueSlug;
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
};

/**
 * Create a new post
 * @param {Object} data 
 * @param {string} authorId 
 * @returns {Promise<Object>}
 */
const createPost = async (data, authorId) => {
  const slug = await generateSlug(data.title);
  const postData = {
    ...data,
    slug,
    authorId
  };
  return postRepository.createPost(postData);
};

/**
 * Get post by ID
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const getPostById = async (id) => {
  const post = await postRepository.findPostById(id);
  if (!post) throwError('Post not found', 'POST_NOT_FOUND', 404);
  return post;
};

/**
 * Get post by Slug
 * @param {string} slug 
 * @returns {Promise<Object>}
 */
const getPostBySlug = async (slug) => {
  const post = await postRepository.findPostBySlug(slug);
  if (!post) throwError('Post not found', 'POST_NOT_FOUND', 404);
  return post;
};

/**
 * Update post
 * @param {string} id 
 * @param {Object} data 
 * @param {string} userId 
 * @param {boolean} isAdmin 
 * @returns {Promise<Object>}
 */
const updatePost = async (id, data, userId, isAdmin) => {
  const post = await getPostById(id);
  
  // Permission Check
  if (post.authorId._id.toString() !== userId && !isAdmin) {
    throwError('Unauthorized', 'FORBIDDEN', 403);
  }

  // Slug regeneration if title changes
  if (data.title && data.title !== post.title) {
    data.slug = await generateSlug(data.title, id);
  }

  return postRepository.updatePost(id, data);
};

/**
 * Delete post
 * @param {string} id 
 * @param {string} userId 
 * @param {boolean} isAdmin 
 * @param {boolean} force 
 */
const deletePost = async (id, userId, isAdmin, force = false) => {
  const post = await getPostById(id);

  if (post.authorId._id.toString() !== userId && !isAdmin) {
    throwError('Unauthorized', 'FORBIDDEN', 403);
  }

  if (force && isAdmin) {
    await postRepository.hardDeletePost(id);
  } else {
    await postRepository.softDeletePost(id);
  }
};

/**
 * List posts with filters
 * Also auto-promotes scheduled posts whose publishedAt time has passed
 * so they become published without needing a separate cron job.
 * @param {Object} params 
 * @returns {Promise<Object>}
 */
const listPosts = async (params) => {
  const { 
    page = 1, limit = 10, sort = 'publishedAt:desc', 
    status, categoryId, tagId, authorId 
  } = params;

  // Auto-publish any scheduled posts whose time has passed
  try {
    await postRepository.bulkUpdatePosts(
      { status: 'scheduled', publishedAt: { $lte: new Date() } },
      { status: 'published' }
    );
  } catch (e) {
    // Fail silently here; listing should still work even if this update fails
  }

  const filter = {};
  if (status) filter.status = status;
  else filter.status = 'published'; // Default public view

  if (categoryId) filter.categoryIds = categoryId;
  if (tagId) filter.tagIds = tagId;
  if (authorId) filter.authorId = authorId;

  const sortParts = sort.split(':');
  const sortObj = { [sortParts[0]]: sortParts[1] === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    postRepository.findPosts(filter, { skip, limit: parseInt(limit), sort: sortObj }),
    postRepository.countPosts(filter)
  ]);

  return { data, total, page, limit };
};

/**
 * Publish post
 * @param {string} id 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const publishPost = async (id, userId) => {
  const post = await getPostById(id);
  if (post.authorId._id.toString() !== userId) throwError('Unauthorized', 'FORBIDDEN', 403);

  return postRepository.updatePost(id, { 
    status: 'published', 
    publishedAt: new Date() 
  });
};

/**
 * Unpublish post
 * @param {string} id 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const unpublishPost = async (id, userId) => {
  const post = await getPostById(id);
  if (post.authorId._id.toString() !== userId) throwError('Unauthorized', 'FORBIDDEN', 403);

  return postRepository.updatePost(id, { status: 'draft' });
};

/**
 * Schedule post
 * @param {string} id 
 * @param {Date} date 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const schedulePost = async (id, date, userId) => {
  const post = await getPostById(id);
  if (post.authorId._id.toString() !== userId) throwError('Unauthorized', 'FORBIDDEN', 403);

  return postRepository.updatePost(id, { 
    status: 'scheduled', 
    publishedAt: date 
  });
};

/**
 * Get scheduled posts
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
const getScheduledPosts = async (userId) => {
  return postRepository.findPosts(
    { status: 'scheduled', authorId: userId },
    { sort: { publishedAt: 1 }, limit: 100, skip: 0 }
  );
};

/**
 * Add multimedia
 * @param {string} id 
 * @param {Object} mediaData 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const addMultimedia = async (id, mediaData, userId) => {
  const post = await getPostById(id);
  if (post.authorId._id.toString() !== userId) throwError('Unauthorized', 'FORBIDDEN', 403);

  return postRepository.updatePost(id, { $push: { multimedia: mediaData } });
};

/**
 * Remove multimedia
 * @param {string} id 
 * @param {string} mediaId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const removeMultimedia = async (id, mediaId, userId) => {
  const post = await getPostById(id);
  if (post.authorId._id.toString() !== userId) throwError('Unauthorized', 'FORBIDDEN', 403);

  return postRepository.updatePost(id, { $pull: { multimedia: { _id: mediaId } } });
};

/**
 * Update SEO
 * @param {string} id 
 * @param {Object} seoData 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const updateSeo = async (id, seoData, userId) => {
  const post = await getPostById(id);
  if (post.authorId._id.toString() !== userId) throwError('Unauthorized', 'FORBIDDEN', 403);

  return postRepository.updatePost(id, { seo: seoData });
};

/**
 * Get SEO Preview
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const getSeoPreview = async (id) => {
  const post = await getPostById(id);
  return {
    google: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.content.substring(0, 160),
      url: `https://mysite.com/posts/${post.slug}`
    }
  };
};

/**
 * Update taxonomy (tags/categories)
 * @param {string} id 
 * @param {Object} data { tagIds, categoryIds }
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const updateTaxonomy = async (id, data, userId) => {
  const post = await getPostById(id);
  if (post.authorId._id.toString() !== userId) throwError('Unauthorized', 'FORBIDDEN', 403);

  const update = {};
  if (data.tagIds) update.tagIds = data.tagIds;
  if (data.categoryIds) update.categoryIds = data.categoryIds;

  return postRepository.updatePost(id, update);
};

/**
 * Increment View Count
 * @param {string} id 
 * @param {string} userId (optional)
 */
const incrementView = async (id, userId = null) => {
  if (userId) {
    const post = await postRepository.addViewer(id, userId);
    // Sync viewCount with array length
    if (post) {
      await postRepository.updatePost(id, { 'cachedStats.viewCount': post.viewedBy.length });
    }
  } else {
    // Fallback for guests: just increment number
    await postRepository.incrementStats(id, 'viewCount', 1);
  }
};

const toggleLike = async (id, userId) => {
  const post = await postRepository.findPostById(id);
  if (!post) throwError('Post not found', 'POST_NOT_FOUND', 404);

  const isLiked = post.likes && post.likes.some(uid => uid.toString() === userId);
  
  if (isLiked) {
    return postRepository.removeLike(id, userId);
  } else {
    return postRepository.addLike(id, userId);
  }
};

/**
 * Search Posts
 * @param {string} query 
 * @returns {Promise<Array>}
 */
const searchPosts = async (query) => {
  return postRepository.searchPosts(query, { limit: 20, skip: 0 });
};

module.exports = {
  createPost,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  listPosts,
  publishPost,
  unpublishPost,
  schedulePost,
  getScheduledPosts,
  addMultimedia,
  removeMultimedia,
  updateSeo,
  getSeoPreview,
  updateTaxonomy,
  incrementView,
  toggleLike,
  searchPosts
};
