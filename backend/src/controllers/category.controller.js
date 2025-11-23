const categoryService = require('../services/category.service');

const create = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const populateParent = req.query.populate === 'parent';
    const category = await categoryService.getCategory(req.params.id, populateParent);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const force = req.query.force === 'true';
    await categoryService.deleteCategory(req.params.id, req.user._id, force);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const hardRemove = async (req, res, next) => {
  try {
    // Ensure admin role middleware is used in routes
    await categoryService.hardDeleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await categoryService.listCategories(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getTree = async (req, res, next) => {
  try {
    const maxDepth = parseInt(req.query.maxDepth) || 10;
    const excludeDeleted = req.query.excludeDeleted !== 'false';
    const tree = await categoryService.getCategoryTree(maxDepth, excludeDeleted);
    res.json(tree);
  } catch (error) {
    next(error);
  }
};

const getChildren = async (req, res, next) => {
  try {
    const children = await categoryService.getCategoryChildren(req.params.id);
    res.json(children);
  } catch (error) {
    next(error);
  }
};

const getAncestors = async (req, res, next) => {
  try {
    const ancestors = await categoryService.getCategoryAncestors(req.params.id);
    res.json(ancestors);
  } catch (error) {
    next(error);
  }
};

const getDescendants = async (req, res, next) => {
  try {
    const descendants = await categoryService.getCategoryDescendants(req.params.id);
    res.json(descendants);
  } catch (error) {
    next(error);
  }
};

const getSelectList = async (req, res, next) => {
  try {
    const list = await categoryService.getSelectList();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getById,
  update,
  remove,
  hardRemove,
  list,
  getTree,
  getChildren,
  getAncestors,
  getDescendants,
  getSelectList
};
