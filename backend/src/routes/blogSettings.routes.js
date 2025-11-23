const express = require('express');
const router = express.Router();
const blogSettingsController = require('../controllers/blogSettings.controller');
const { authenticateJwt } = require('../middleware/auth');

// Apply Auth Middleware globally for settings
router.use(authenticateJwt);

// Core Settings
router.get('/', blogSettingsController.getSettings);
router.post('/', blogSettingsController.createSettings);
router.put('/', blogSettingsController.updateSettings);
router.patch('/', blogSettingsController.updateSettings);
router.delete('/', blogSettingsController.deleteSettings);
router.get('/exists', blogSettingsController.checkExists);

// Theme
router.get('/theme', blogSettingsController.getTheme);
router.patch('/theme', blogSettingsController.updateTheme);
router.put('/theme', blogSettingsController.updateTheme);
router.post('/theme/preview', blogSettingsController.previewTheme);

// Presets
router.get('/presets', blogSettingsController.getPresets);
router.post('/presets', blogSettingsController.addPreset);
router.post('/presets/import', blogSettingsController.importPresets);
router.get('/presets/export', blogSettingsController.exportPresets);

router.get('/presets/:presetId', blogSettingsController.getPresetById);
router.put('/presets/:presetId', blogSettingsController.updatePreset);
router.patch('/presets/:presetId', blogSettingsController.updatePreset);
router.delete('/presets/:presetId', blogSettingsController.deletePreset);
router.post('/presets/:presetId/apply', blogSettingsController.applyPreset);

// Social
router.get('/social/webhooks/callback', blogSettingsController.socialWebhookCallback); // Order matters before :socialId

router.get('/social', blogSettingsController.getSocial);
router.post('/social', blogSettingsController.addSocial);

router.put('/social/:socialId', blogSettingsController.updateSocial);
router.delete('/social/:socialId', blogSettingsController.deleteSocial);
router.post('/social/:socialId/validate', blogSettingsController.validateSocial);
router.post('/social/:socialId/token-rotate', blogSettingsController.rotateSocialToken);
router.post('/social/:socialId/share', blogSettingsController.shareSocial);
router.get('/social/:socialId/sync-log', blogSettingsController.getSocialSyncLog);


// SEO
router.get('/seo', blogSettingsController.getSeo);
router.patch('/seo', blogSettingsController.updateSeo);
router.post('/seo/preview', blogSettingsController.previewSeo);

module.exports = router;
