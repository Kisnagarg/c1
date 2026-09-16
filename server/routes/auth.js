const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('phone').trim().notEmpty().withMessage('Customer phone number is mandatory').isLength({ min: 10 }).withMessage('Please enter a valid phone number (at least 10 digits)'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.register);


// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// POST /api/auth/google
router.post('/google', authController.googleLogin);

// GET /api/auth/me
router.get('/me', auth, authController.getMe);


// PUT /api/auth/profile
router.put('/profile', [
  auth,
  body('phone').trim().notEmpty().withMessage('Customer phone number is mandatory').isLength({ min: 10 }).withMessage('Please enter a valid phone number (at least 10 digits)')
], authController.updateProfile);

// PUT /api/auth/change-password
router.put('/change-password', auth, authController.changePassword);

// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router;

