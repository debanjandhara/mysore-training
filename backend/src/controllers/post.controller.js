const postService = require('../services/post.service');

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await postService.getAllPosts();
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost({
      ...req.body,
      author: req.user._id
    });
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(req.params.id, req.body);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id);
    res.json({ message: 'Post deleted', code: 'SUCCESS' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
};
