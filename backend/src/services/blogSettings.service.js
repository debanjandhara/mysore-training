const blogSettingsRepository = require('../repositories/blogSettings.repository');

// Error Helper
const throwError = (message, code, status = 400) => {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  throw error;
};

/**
 * Get settings for a user
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const getSettings = async (userId) => {
  const settings = await blogSettingsRepository.findByUserId(userId);
  if (!settings) throwError('Settings not found', 'SETTINGS_NOT_FOUND', 404);
  return settings;
};

/**
 * Check if settings exist
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const settingsExists = async (userId) => {
  const settings = await blogSettingsRepository.findByUserId(userId);
  return { exists: !!settings };
};

/**
 * Create settings
 * @param {string} userId 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const createSettings = async (userId, data) => {
  const existing = await blogSettingsRepository.findByUserId(userId);
  if (existing) throwError('Settings already exist', 'SETTINGS_EXIST', 409);
  
  return blogSettingsRepository.create({ ...data, userId });
};

/**
 * Update settings
 * @param {string} userId 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
const updateSettings = async (userId, data) => {
  const settings = await blogSettingsRepository.updateByUserId(userId, data);
  if (!settings) throwError('Settings not found', 'SETTINGS_NOT_FOUND', 404);
  return settings;
};

/**
 * Delete settings (soft)
 * @param {string} userId 
 */
const deleteSettings = async (userId) => {
  const settings = await blogSettingsRepository.softDeleteByUserId(userId);
  if (!settings) throwError('Settings not found', 'SETTINGS_NOT_FOUND', 404);
};

// ==========================================
// THEME SERVICES
// ==========================================

/**
 * Get theme config
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const getTheme = async (userId) => {
  const settings = await getSettings(userId);
  return settings.themeConfig;
};

/**
 * Update theme config
 * @param {string} userId 
 * @param {Object} themeData 
 * @returns {Promise<Object>}
 */
const updateTheme = async (userId, themeData) => {
  // Using dot notation for partial updates would be ideal, 
  // but map to themeConfig field for simplicity in repository
  const current = await getSettings(userId);
  const newConfig = { ...current.themeConfig.toObject(), ...themeData };
  
  const settings = await blogSettingsRepository.updateByUserId(userId, { themeConfig: newConfig });
  return settings.themeConfig;
};

/**
 * Preview theme
 * @param {Object} themeData 
 * @returns {Object}
 */
const previewTheme = (themeData) => {
  // Mock preview generation
  return {
    previewUrl: 'https://example.com/preview/generated-hash',
    config: themeData,
    generatedCss: `:root { --primary: ${themeData.primaryColor || '#3b82f6'}; font-family: ${themeData.fontFamily || 'Roboto'}; }`
  };
};

// ==========================================
// PRESET SERVICES
// ==========================================

/**
 * Get all presets
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
const getPresets = async (userId) => {
  const settings = await getSettings(userId);
  return settings.savedDesignPresets;
};

/**
 * Add new preset
 * @param {string} userId 
 * @param {Object} presetData 
 * @returns {Promise<Object>}
 */
const addPreset = async (userId, presetData) => {
  const settings = await blogSettingsRepository.addPreset(userId, presetData);
  // Return the last added preset
  return settings.savedDesignPresets[settings.savedDesignPresets.length - 1];
};

/**
 * Get single preset
 * @param {string} userId 
 * @param {string} presetId 
 * @returns {Promise<Object>}
 */
const getPresetById = async (userId, presetId) => {
  const settings = await getSettings(userId);
  const preset = settings.savedDesignPresets.id(presetId);
  if (!preset) throwError('Preset not found', 'PRESET_NOT_FOUND', 404);
  return preset;
};

/**
 * Update preset
 * @param {string} userId 
 * @param {string} presetId 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
const updatePreset = async (userId, presetId, updateData) => {
  const settings = await getSettings(userId);
  const preset = settings.savedDesignPresets.id(presetId);
  if (!preset) throwError('Preset not found', 'PRESET_NOT_FOUND', 404);
  
  Object.assign(preset, updateData);
  await settings.save();
  return preset;
};

/**
 * Delete preset
 * @param {string} userId 
 * @param {string} presetId 
 */
const deletePreset = async (userId, presetId) => {
  await blogSettingsRepository.removePreset(userId, presetId);
};

/**
 * Apply preset
 * @param {string} userId 
 * @param {string} presetId 
 * @returns {Promise<Object>}
 */
const applyPreset = async (userId, presetId) => {
  const settings = await getSettings(userId);
  const preset = settings.savedDesignPresets.id(presetId);
  if (!preset) throwError('Preset not found', 'PRESET_NOT_FOUND', 404);
  
  settings.themeConfig = { ...settings.themeConfig.toObject(), ...preset.config };
  await settings.save();
  return settings.themeConfig;
};

// ==========================================
// SOCIAL SERVICES
// ==========================================

/**
 * Get social integrations
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
const getSocial = async (userId) => {
  const settings = await getSettings(userId);
  return settings.socialIntegrations;
};

/**
 * Add social integration
 * @param {string} userId 
 * @param {Object} socialData 
 * @returns {Promise<Object>}
 */
const addSocial = async (userId, socialData) => {
  // Simple validation to prevent duplicate platforms could be added here
  const settings = await blogSettingsRepository.addSocialIntegration(userId, socialData);
  return settings.socialIntegrations[settings.socialIntegrations.length - 1];
};

/**
 * Update social integration
 * @param {string} userId 
 * @param {string} socialId 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
const updateSocial = async (userId, socialId, updateData) => {
  const settings = await getSettings(userId);
  const social = settings.socialIntegrations.id(socialId);
  if (!social) throwError('Social integration not found', 'SOCIAL_NOT_FOUND', 404);
  
  Object.assign(social, updateData);
  await settings.save();
  return social;
};

/**
 * Delete social integration
 * @param {string} userId 
 * @param {string} socialId 
 */
const deleteSocial = async (userId, socialId) => {
  await blogSettingsRepository.removeSocialIntegration(userId, socialId);
};

/**
 * Validate social token
 * @param {string} userId 
 * @param {string} socialId 
 * @returns {Promise<Object>}
 */
const validateSocial = async (userId, socialId) => {
  const social = await blogSettingsRepository.findSocialWithToken(userId, socialId);
  if (!social) throwError('Social integration not found', 'SOCIAL_NOT_FOUND', 404);
  
  // Mock validation logic
  const isValid = !!social.accessToken && social.accessToken.length > 5;
  return { valid: isValid, platform: social.platform };
};

/**
 * Rotate social token
 * @param {string} userId 
 * @param {string} socialId 
 * @returns {Promise<Object>}
 */
const rotateSocialToken = async (userId, socialId) => {
  // Mock rotation
  const newToken = `new_token_${Date.now()}`;
  return updateSocial(userId, socialId, { accessToken: newToken });
};

// ==========================================
// SEO SERVICES
// ==========================================

/**
 * Get SEO defaults
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
const getSeo = async (userId) => {
  const settings = await getSettings(userId);
  return settings.seoDefaults;
};

/**
 * Update SEO defaults
 * @param {string} userId 
 * @param {Object} seoData 
 * @returns {Promise<Object>}
 */
const updateSeo = async (userId, seoData) => {
  const settings = await blogSettingsRepository.updateByUserId(userId, { seoDefaults: seoData });
  return settings.seoDefaults;
};

/**
 * Preview SEO
 * @param {Object} seoData 
 * @returns {Object}
 */
const previewSeo = (seoData) => {
  return {
    googlePreview: {
      title: seoData.defaultMetaTitle || 'Site Title',
      description: seoData.defaultMetaDescription || 'Site description...',
      url: 'https://mysite.com'
    }
  };
};

module.exports = {
  getSettings,
  settingsExists,
  createSettings,
  updateSettings,
  deleteSettings,
  getTheme,
  updateTheme,
  previewTheme,
  getPresets,
  addPreset,
  getPresetById,
  updatePreset,
  deletePreset,
  applyPreset,
  getSocial,
  addSocial,
  updateSocial,
  deleteSocial,
  validateSocial,
  rotateSocialToken,
  getSeo,
  updateSeo,
  previewSeo
};
