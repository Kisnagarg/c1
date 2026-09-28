const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer disk storage for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  }
});

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
