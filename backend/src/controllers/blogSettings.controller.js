const blogSettingsService = require('../services/blogSettings.service');

/**
 * Get core settings
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const getSettings = async (req, res, next) => {
  try {
    const settings = await blogSettingsService.getSettings(req.user.id);
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Create settings
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const createSettings = async (req, res, next) => {
  try {
    const settings = await blogSettingsService.createSettings(req.user.id, req.body);
    res.status(201).json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update settings (PUT)
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const updateSettings = async (req, res, next) => {
  try {
    const settings = await blogSettingsService.updateSettings(req.user.id, req.body);
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete settings
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const deleteSettings = async (req, res, next) => {
  try {
    await blogSettingsService.deleteSettings(req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if settings exist
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const checkExists = async (req, res, next) => {
  try {
    const result = await blogSettingsService.settingsExists(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get theme
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const getTheme = async (req, res, next) => {
  try {
    const theme = await blogSettingsService.getTheme(req.user.id);
    res.status(200).json(theme);
  } catch (error) {
    next(error);
  }
};

/**
 * Update theme
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const updateTheme = async (req, res, next) => {
  try {
    const theme = await blogSettingsService.updateTheme(req.user.id, req.body);
    res.status(200).json(theme);
  } catch (error) {
    next(error);
  }
};

/**
 * Preview theme
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const previewTheme = (req, res, next) => {
  try {
    const preview = blogSettingsService.previewTheme(req.body);
    res.status(200).json(preview);
  } catch (error) {
    next(error);
  }
};

// Presets Controllers

const getPresets = async (req, res, next) => {
  try {
    const presets = await blogSettingsService.getPresets(req.user.id);
    res.status(200).json(presets);
  } catch (error) {
    next(error);
  }
};

const addPreset = async (req, res, next) => {
  try {
    const preset = await blogSettingsService.addPreset(req.user.id, req.body);
    res.status(201).json(preset);
  } catch (error) {
    next(error);
  }
};

const getPresetById = async (req, res, next) => {
  try {
    const preset = await blogSettingsService.getPresetById(req.user.id, req.params.presetId);
    res.status(200).json(preset);
  } catch (error) {
    next(error);
  }
};

const updatePreset = async (req, res, next) => {
  try {
    const preset = await blogSettingsService.updatePreset(req.user.id, req.params.presetId, req.body);
    res.status(200).json(preset);
  } catch (error) {
    next(error);
  }
};

const deletePreset = async (req, res, next) => {
  try {
    await blogSettingsService.deletePreset(req.user.id, req.params.presetId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const applyPreset = async (req, res, next) => {
  try {
    const theme = await blogSettingsService.applyPreset(req.user.id, req.params.presetId);
    res.status(200).json(theme);
  } catch (error) {
    next(error);
  }
};

const importPresets = async (req, res, next) => {
  try {
    // Assuming import creates a new preset from body
    const preset = await blogSettingsService.addPreset(req.user.id, req.body);
    res.status(201).json(preset);
  } catch (error) {
    next(error);
  }
};

const exportPresets = async (req, res, next) => {
  try {
    const presets = await blogSettingsService.getPresets(req.user.id);
    res.status(200).json({ exportDate: new Date(), presets });
  } catch (error) {
    next(error);
  }
};

// Social Controllers

const getSocial = async (req, res, next) => {
  try {
    const social = await blogSettingsService.getSocial(req.user.id);
    res.status(200).json(social);
  } catch (error) {
    next(error);
  }
};

const addSocial = async (req, res, next) => {
  try {
    const social = await blogSettingsService.addSocial(req.user.id, req.body);
    res.status(201).json(social);
  } catch (error) {
    next(error);
  }
};

const updateSocial = async (req, res, next) => {
  try {
    const social = await blogSettingsService.updateSocial(req.user.id, req.params.socialId, req.body);
    res.status(200).json(social);
  } catch (error) {
    next(error);
  }
};

const deleteSocial = async (req, res, next) => {
  try {
    await blogSettingsService.deleteSocial(req.user.id, req.params.socialId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const validateSocial = async (req, res, next) => {
  try {
    const result = await blogSettingsService.validateSocial(req.user.id, req.params.socialId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const rotateSocialToken = async (req, res, next) => {
  try {
    const social = await blogSettingsService.rotateSocialToken(req.user.id, req.params.socialId);
    res.status(200).json(social);
  } catch (error) {
    next(error);
  }
};

const shareSocial = async (req, res, next) => {
  try {
    // Mock share functionality
    res.status(200).json({ message: 'Shared successfully', platformId: '12345' });
  } catch (error) {
    next(error);
  }
};

const socialWebhookCallback = async (req, res, next) => {
  try {
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

const getSocialSyncLog = async (req, res, next) => {
  try {
    // Mock log
    res.status(200).json([{ timestamp: new Date(), status: 'success' }]);
  } catch (error) {
    next(error);
  }
};

// SEO Controllers

const getSeo = async (req, res, next) => {
  try {
    const seo = await blogSettingsService.getSeo(req.user.id);
    res.status(200).json(seo);
  } catch (error) {
    next(error);
  }
};

const updateSeo = async (req, res, next) => {
  try {
    const seo = await blogSettingsService.updateSeo(req.user.id, req.body);
    res.status(200).json(seo);
  } catch (error) {
    next(error);
  }
};

const previewSeo = (req, res, next) => {
  try {
    const preview = blogSettingsService.previewSeo(req.body);
    res.status(200).json(preview);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  createSettings,
  updateSettings,
  deleteSettings,
  checkExists,
  getTheme,
  updateTheme,
  previewTheme,
  getPresets,
  addPreset,
  getPresetById,
  updatePreset,
  deletePreset,
  applyPreset,
  importPresets,
  exportPresets,
  getSocial,
  addSocial,
  updateSocial,
  deleteSocial,
  validateSocial,
  rotateSocialToken,
  shareSocial,
  socialWebhookCallback,
  getSocialSyncLog,
  getSeo,
  updateSeo,
  previewSeo
};
