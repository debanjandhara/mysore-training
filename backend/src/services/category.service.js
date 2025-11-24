const categoryRepository = require('../repositories/category.repository');
const tagRepository = require('../repositories/tag.repository');
const postRepository = require('../repositories/post.repository');
const mongoose = require('mongoose');

// Helper: Error Factory
const throwError = (message, code, status = 400) => {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  throw error;
};

/**
 * Generate unique slug
 * @param {string} name 
 * @param {string} [currentId] 
 * @returns {Promise<string>}
 */
const generateSlug = async (name, currentId = null) => {
  let slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  let uniqueSlug = slug;
  let counter = 1;
  
  while (true) {
    const existing = await categoryRepository.findBySlug(uniqueSlug);
    if (!existing || (currentId && existing._id.toString() === currentId.toString())) {
      return uniqueSlug;
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
};

/**
 * Check for circular dependency
 * @param {string} categoryId 
 * @param {string} newParentId 
 */
const checkCircularDependency = async (categoryId, newParentId) => {
  if (!newParentId) return; // No parent, no circle
  if (categoryId.toString() === newParentId.toString()) {
    throwError('Category cannot be its own parent', 'CIRCULAR_DEPENDENCY');
  }

  const descendants = await categoryRepository.getDescendants(categoryId);
  const isDescendant = descendants.some(d => d._id.toString() === newParentId.toString());
  
  if (isDescendant) {
    throwError('Parent category cannot be a descendant of this category', 'CIRCULAR_DEPENDENCY');
  }
};

/**
 * Create category
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const createCategory = async (data) => {
  const slug = data.slug || await generateSlug(data.name);
  
  // Validate unique slug
  const existingSlug = await categoryRepository.findBySlug(slug);
  if (existingSlug) {
    throwError('Slug must be unique', 'SLUG_EXISTS');
  }

  // Validate parent exists
  if (data.parentCategoryId) {
    const parent = await categoryRepository.findById(data.parentCategoryId);
    if (!parent) {
      throwError('Parent category not found', 'PARENT_NOT_FOUND', 404);
    }
  }

  return categoryRepository.create({ ...data, slug });
};

/**
 * Get category by ID or Slug
 * @param {string} identifier 
 * @param {boolean} populateParent 
 * @returns {Promise<Object>}
 */
const getCategory = async (identifier, populateParent = false) => {
  let category = await categoryRepository.findByIdOrSlug(identifier);
  
  if (!category) {
    throwError('Category not found', 'CATEGORY_NOT_FOUND', 404);
  }

  if (populateParent && category.parentCategoryId) {
    category = await category.populate('parentCategoryId', 'name slug');
  }

  return category;
};

/**
 * Update category
 * @param {string} id 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const updateCategory = async (id, data) => {
  const category = await categoryRepository.findById(id);
  if (!category) throwError('Category not found', 'CATEGORY_NOT_FOUND', 404);

  // Check Slug Uniqueness
  if (data.slug && data.slug !== category.slug) {
    const existing = await categoryRepository.findBySlug(data.slug);
    if (existing) throwError('Slug already exists', 'SLUG_EXISTS');
  } else if (!data.slug && data.name && data.name !== category.name) {
    // Auto-update slug if name changes and no slug provided
    data.slug = await generateSlug(data.name, id);
  }

  // Circular Check
  if (data.parentCategoryId && data.parentCategoryId.toString() !== (category.parentCategoryId || '').toString()) {
    await checkCircularDependency(id, data.parentCategoryId);
  }

  return categoryRepository.update(id, data);
};

/**
 * Delete category
 * @param {string} id 
 * @param {string} userId 
 * @param {boolean} force 
 */
const deleteCategory = async (id, userId, force = false) => {
  const children = await categoryRepository.findChildren(id);
  
  if (children.length > 0 && !force) {
    throwError('Cannot delete category with children. Use force=true to cascade.', 'HAS_CHILDREN');
  }

  await categoryRepository.softDelete(id, userId);
};

/**
 * Hard delete category
 * @param {string} id 
 */
const hardDeleteCategory = async (id) => {
  await categoryRepository.hardDelete(id);
};

/**
 * List categories
 * @param {Object} params 
 * @returns {Promise<Object>}
 */
const listCategories = async (params) => {
  const { 
    q, parentId, page = 1, limit = 20, sort = 'name:asc' 
  } = params;

  const filter = {};
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (parentId !== undefined) filter.parentCategoryId = parentId === 'null' ? null : parentId;

  const sortParts = sort.split(':');
  const sortObj = { [sortParts[0]]: sortParts[1] === 'desc' ? -1 : 1 };

  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    categoryRepository.list(filter, { sort: sortObj, limit: parseInt(limit), skip }),
    categoryRepository.count(filter)
  ]);

  return { data, total, page, limit };
};

/**
 * Get category tree
 * @param {number} maxDepth 
 * @param {boolean} excludeDeleted 
 * @returns {Promise<Array>}
 */
const getCategoryTree = async (maxDepth = 10, excludeDeleted = true) => {
  const categories = await categoryRepository.getTree(maxDepth, excludeDeleted);
  
  const buildTree = (parentId) => {
    return categories
      .filter(c => (c.parentCategoryId || null) == (parentId || null)) // loose equality for null/undefined check
      .map(c => ({
        ...c,
        children: buildTree(c._id)
      }));
  };

  return buildTree(null);
};

/**
 * Get immediate children
 * @param {string} id 
 * @returns {Promise<Array>}
 */
const getCategoryChildren = async (id) => {
  return categoryRepository.findChildren(id);
};

/**
 * Get ancestors
 * @param {string} id 
 * @returns {Promise<Array>}
 */
const getCategoryAncestors = async (id) => {
  return categoryRepository.getAncestors(id);
};

/**
 * Get descendants
 * @param {string} id 
 * @returns {Promise<Array>}
 */
const getCategoryDescendants = async (id) => {
  return categoryRepository.getDescendants(id);
};

/**
 * Get select list
 * @returns {Promise<Array>}
 */
const getSelectList = async () => {
  const categories = await categoryRepository.list({}, { sort: { name: 1 }, limit: 1000, skip: 0 });
  return categories.map(c => ({
    _id: c._id,
    name: c.name,
    slug: c.slug,
    parentCategoryId: c.parentCategoryId
  }));
};

/**
 * Migrate category to tag
 * @param {string} categoryId 
 * @param {string} tagId 
 */
const migrateToTag = async (categoryId, tagId) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) throwError('Category not found', 'CATEGORY_NOT_FOUND', 404);

  const tag = await tagRepository.findById(tagId);
  if (!tag) throwError('Tag not found', 'TAG_NOT_FOUND', 404);

  // Update all posts: Add tagId, Remove categoryId
  await postRepository.bulkUpdatePosts(
    { categoryIds: categoryId },
    { 
      $addToSet: { tagIds: tagId },
      $pull: { categoryIds: categoryId }
    }
  );

  // Delete the category
  // Assuming we use null for userId as this is an admin/system op and auth is removed
  await categoryRepository.softDelete(categoryId, null);
};

module.exports = {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  hardDeleteCategory,
  listCategories,
  getCategoryTree,
  getCategoryChildren,
  getCategoryAncestors,
  getCategoryDescendants,
  getSelectList,
  migrateToTag
};
