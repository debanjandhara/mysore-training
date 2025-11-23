const postRepository = require('../repositories/post.repository');

/**
 * Create a new post
 * @param {Object} postData 
 * @returns {Object} post
 */
const createPost = async (postData) => {
  return postRepository.createPost(postData);
};

/**
 * Get all posts
 * @returns {Array} posts
 */
const getAllPosts = async () => {
  return postRepository.findAllPosts();
};

/**
 * Update a post
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Object} post
 */
const updatePost = async (id, updateData) => {
  const post = await postRepository.updatePost(id, updateData);
  if (!post) {
    const error = new Error('Post not found');
    error.code = 'POST_NOT_FOUND';
    throw error;
  }
  return post;
};

/**
 * Delete a post
 * @param {string} id 
 */
const deletePost = async (id) => {
  const post = await postRepository.deletePost(id);
  if (!post) {
    const error = new Error('Post not found');
    error.code = 'POST_NOT_FOUND';
    throw error;
  }
};

module.exports = {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
};
