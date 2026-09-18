const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public route to get store settings (contact info, UPI ID, QR, advance amount)
router.get('/', settingsController.getSettings);

// Admin protected route to update settings
router.put('/', auth, admin, settingsController.updateSettings);

module.exports = router;
