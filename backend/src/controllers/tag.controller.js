const tagService = require('../services/tag.service');

const create = async (req, res, next) => {
  try {
    const tag = await tagService.createTag(req.body);
    res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const tag = await tagService.getTag(req.params.id);
    res.json(tag);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const tag = await tagService.updateTag(req.params.id, req.body);
    res.json(tag);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const force = req.query.force === 'true';
    await tagService.deleteTag(req.params.id, force);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await tagService.listTags(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getTop = async (req, res, next) => {
  try {
    const tags = await tagService.getTopTags();
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

const suggest = async (req, res, next) => {
  try {
    const tags = await tagService.suggestTags(req.query.q);
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

const getSelectList = async (req, res, next) => {
  try {
    const list = await tagService.getSelectList();
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
  list,
  getTop,
  suggest,
  getSelectList
};
