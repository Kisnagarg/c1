const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Use multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per image
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Admin protected upload routes for products, categories, QR code
router.post('/single', auth, admin, upload.single('image'), uploadController.uploadSingleImage);
router.post('/multiple', auth, admin, upload.array('images', 8), uploadController.uploadMultipleImages);

// Customer upload route for payment screenshots
router.post('/payment-proof', auth, upload.single('image'), uploadController.uploadPaymentProof);

module.exports = router;
