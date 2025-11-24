const postService = require('../services/post.service');

// CRUD

const create = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.body, req.user._id);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.params.id);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const post = await postService.getPostBySlug(req.params.slug);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const post = await postService.updatePost(req.params.id, req.body, req.user._id.toString(), isAdmin);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const force = req.query.force === 'true';
    await postService.deletePost(req.params.id, req.user._id.toString(), isAdmin, force);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await postService.listPosts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Publishing

const publish = async (req, res, next) => {
  try {
    const post = await postService.publishPost(req.params.id, req.user._id.toString());
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const unpublish = async (req, res, next) => {
  try {
    const post = await postService.unpublishPost(req.params.id, req.user._id.toString());
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const schedule = async (req, res, next) => {
  try {
    const { date } = req.body;
    const post = await postService.schedulePost(req.params.id, date, req.user._id.toString());
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const getScheduled = async (req, res, next) => {
  try {
    const posts = await postService.getScheduledPosts(req.user._id.toString());
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// Multimedia

const addMultimedia = async (req, res, next) => {
  try {
    const post = await postService.addMultimedia(req.params.id, req.body, req.user._id.toString());
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const removeMultimedia = async (req, res, next) => {
  try {
    const post = await postService.removeMultimedia(req.params.id, req.params.mid, req.user._id.toString());
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// Taxonomy

const updateTags = async (req, res, next) => {
  try {
    const { tagIds } = req.body;
    const post = await postService.updateTaxonomy(req.params.id, { tagIds }, req.user._id.toString());
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const updateCategories = async (req, res, next) => {
  try {
    const { categoryIds } = req.body;
    const post = await postService.updateTaxonomy(req.params.id, { categoryIds }, req.user._id.toString());
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// SEO

const updateSeo = async (req, res, next) => {
  try {
    const post = await postService.updateSeo(req.params.id, req.body, req.user._id.toString());
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const getSeoPreview = async (req, res, next) => {
  try {
    const preview = await postService.getSeoPreview(req.params.id);
    res.json(preview);
  } catch (error) {
    next(error);
  }
};

// Stats

const viewStat = async (req, res, next) => {
  try {
    await postService.incrementView(req.params.id);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

// Search

const search = async (req, res, next) => {
  try {
    const posts = await postService.searchPosts(req.query.q);
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getById,
  getBySlug,
  update,
  remove,
  list,
  publish,
  unpublish,
  schedule,
  getScheduled,
  addMultimedia,
  removeMultimedia,
  updateTags,
  updateCategories,
  updateSeo,
  getSeoPreview,
  viewStat,
  search
};
