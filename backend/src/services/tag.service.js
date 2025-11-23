const tagRepository = require('../repositories/tag.repository');

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
    const existing = await tagRepository.findBySlug(uniqueSlug);
    if (!existing || (currentId && existing._id.toString() === currentId.toString())) {
      return uniqueSlug;
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
};

/**
 * Create tag
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const createTag = async (data) => {
  const slug = data.slug || await generateSlug(data.name);
  
  const existing = await tagRepository.findBySlug(slug);
  if (existing) throwError('Slug already exists', 'SLUG_EXISTS');

  return tagRepository.create({ ...data, slug });
};

/**
 * Get tag
 * @param {string} id 
 * @returns {Promise<Object>}
 */
const getTag = async (id) => {
  const tag = await tagRepository.findById(id);
  if (!tag) throwError('Tag not found', 'TAG_NOT_FOUND', 404);
  return tag;
};

/**
 * Update tag
 * @param {string} id 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const updateTag = async (id, data) => {
  const tag = await tagRepository.findById(id);
  if (!tag) throwError('Tag not found', 'TAG_NOT_FOUND', 404);

  if (data.slug && data.slug !== tag.slug) {
    const existing = await tagRepository.findBySlug(data.slug);
    if (existing) throwError('Slug already exists', 'SLUG_EXISTS');
  } else if (!data.slug && data.name && data.name !== tag.name) {
    data.slug = await generateSlug(data.name, id);
  }

  return tagRepository.update(id, data);
};

/**
 * Delete tag
 * @param {string} id 
 * @param {boolean} force 
 */
const deleteTag = async (id, force = false) => {
  if (force) {
    await tagRepository.hardDelete(id);
  } else {
    await tagRepository.softDelete(id);
  }
};

/**
 * List tags
 * @param {Object} params 
 * @returns {Promise<Object>}
 */
const listTags = async (params) => {
  const { q, page = 1, limit = 20, sort = 'name:asc' } = params;

  const filter = {};
  if (q) filter.name = { $regex: q, $options: 'i' };

  const sortParts = sort.split(':');
  const sortObj = { [sortParts[0]]: sortParts[1] === 'desc' ? -1 : 1 };
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    tagRepository.list(filter, { sort: sortObj, limit: parseInt(limit), skip }),
    tagRepository.count(filter)
  ]);

  return { data, total, page, limit };
};

/**
 * Suggest tags
 * @param {string} query 
 * @returns {Promise<Array>}
 */
const suggestTags = async (query) => {
  if (!query) return [];
  return tagRepository.search(query);
};

/**
 * Get top tags (Mock logic placeholder)
 * @returns {Promise<Array>}
 */
const getTopTags = async () => {
  return tagRepository.list({}, { sort: { name: 1 }, limit: 10, skip: 0 });
};

/**
 * Get select list
 * @returns {Promise<Array>}
 */
const getSelectList = async () => {
  const tags = await tagRepository.list({}, { sort: { name: 1 }, limit: 100, skip: 0 });
  return tags.map(t => ({ _id: t._id, name: t.name, slug: t.slug }));
};

module.exports = {
  createTag,
  getTag,
  updateTag,
  deleteTag,
  listTags,
  suggestTags,
  getTopTags,
  getSelectList
};
