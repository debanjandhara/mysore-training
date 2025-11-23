const BlogSettings = require('../models/blogSettings.model');

/**
 * Find settings by User ID (excluding soft deleted)
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const findByUserId = (userId) => {
  return BlogSettings.findOne({ userId, deletedAt: null });
};

/**
 * Create new settings
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const create = (data) => {
  return BlogSettings.create(data);
};

/**
 * Update settings by User ID
 * @param {string} userId 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
const updateByUserId = (userId, updateData) => {
  return BlogSettings.findOneAndUpdate(
    { userId, deletedAt: null },
    updateData,
    { new: true, runValidators: true }
  );
};

/**
 * Soft delete settings
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const softDeleteByUserId = (userId) => {
  return BlogSettings.findOneAndUpdate(
    { userId, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );
};

/**
 * Add a preset to the list
 * @param {string} userId 
 * @param {Object} preset 
 * @returns {Promise<Object>}
 */
const addPreset = (userId, preset) => {
  return BlogSettings.findOneAndUpdate(
    { userId, deletedAt: null },
    { $push: { savedDesignPresets: preset } },
    { new: true }
  );
};

/**
 * Remove a preset
 * @param {string} userId 
 * @param {string} presetId 
 * @returns {Promise<Object>}
 */
const removePreset = (userId, presetId) => {
  return BlogSettings.findOneAndUpdate(
    { userId, deletedAt: null },
    { $pull: { savedDesignPresets: { _id: presetId } } },
    { new: true }
  );
};

/**
 * Add a social integration
 * @param {string} userId 
 * @param {Object} socialData 
 * @returns {Promise<Object>}
 */
const addSocialIntegration = (userId, socialData) => {
  return BlogSettings.findOneAndUpdate(
    { userId, deletedAt: null },
    { $push: { socialIntegrations: socialData } },
    { new: true }
  );
};

/**
 * Remove a social integration
 * @param {string} userId 
 * @param {string} socialId 
 * @returns {Promise<Object>}
 */
const removeSocialIntegration = (userId, socialId) => {
  return BlogSettings.findOneAndUpdate(
    { userId, deletedAt: null },
    { $pull: { socialIntegrations: { _id: socialId } } },
    { new: true }
  );
};

/**
 * Get social integration with token (select: +accessToken)
 * @param {string} userId 
 * @param {string} socialId
 * @returns {Promise<Object>}
 */
const findSocialWithToken = async (userId, socialId) => {
  const settings = await BlogSettings.findOne(
    { userId, deletedAt: null, 'socialIntegrations._id': socialId },
    { 'socialIntegrations.$': 1 }
  ).select('+socialIntegrations.accessToken');
  
  return settings ? settings.socialIntegrations[0] : null;
};

module.exports = {
  findByUserId,
  create,
  updateByUserId,
  softDeleteByUserId,
  addPreset,
  removePreset,
  addSocialIntegration,
  removeSocialIntegration,
  findSocialWithToken
};
