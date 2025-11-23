const Post = require('../models/post.model');

const createPost = (postData) => {
  return Post.create(postData);
};

const findAllPosts = () => {
  return Post.find().populate('author', 'name email username');
};

const findPostById = (id) => {
  return Post.findById(id).populate('author', 'name email username');
};

const updatePost = (id, postData) => {
  return Post.findByIdAndUpdate(id, postData, { new: true });
};

const deletePost = (id) => {
  return Post.findByIdAndDelete(id);
};

module.exports = {
  createPost,
  findAllPosts,
  findPostById,
  updatePost,
  deletePost,
};
