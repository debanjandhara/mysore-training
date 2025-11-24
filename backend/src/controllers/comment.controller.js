const commentService = require('../services/comment.service');

// CRUD

const create = async (req, res, next) => {
  try {
    const comment = await commentService.createComment(req.body, req.user._id);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const includeChildren = req.query.includeChildren === 'true';
    const comment = await commentService.getCommentById(req.params.id, includeChildren);
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await commentService.updateComment(req.params.id, content, req.user._id.toString());
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    await commentService.deleteComment(req.params.id, req.user._id.toString(), isAdmin);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const comment = await commentService.updateStatus(req.params.id, status, req.user._id.toString());
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

// Listing

const getByPost = async (req, res, next) => {
  try {
    console.log('[comment.controller.getByPost] Incoming request:', {
      path: req.path,
      method: req.method,
      postId: req.params.postId,
      query: req.query,
      user: req.user ? { id: req.user._id?.toString?.() || req.user.id, role: req.user.role } : null,
    });

    const result = await commentService.getPostComments(req.params.postId, req.query);
    res.json(result);
  } catch (error) {
    console.error('[comment.controller.getByPost] Error:', error);
    next(error);
  }
};

const getReplies = async (req, res, next) => {
  try {
    const result = await commentService.getReplies(req.params.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getTree = async (req, res, next) => {
  try {
    const tree = await commentService.getCommentTree(req.query.postId, req.query);
    res.json(tree);
  } catch (error) {
    next(error);
  }
};

// Voting

const vote = async (req, res, next) => {
  try {
    const { action } = req.body;
    const comment = await commentService.voteComment(req.params.id, req.user._id.toString(), action);
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

const getVotes = async (req, res, next) => {
  try {
    // userId might be null if public, but auth middleware usually ensures user
    const userId = req.user ? req.user._id.toString() : null;
    const votes = await commentService.getVotes(req.params.id, userId);
    res.json(votes);
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await commentService.listComments(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getById,
  list,
  update,
  remove,
  updateStatus,
  getByPost,
  getReplies,
  getTree,
  vote,
  getVotes
};
