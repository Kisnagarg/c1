const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper to construct public URL for uploaded file
const getFileUrl = (req, filename) => {
  return `/uploads/${filename}`;
};

// Helper to save base64 data URI to disk if sent in request body
const saveBase64ToFile = (base64String, prefix = 'upload') => {
  const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  let ext = '.png';
  let buffer;

  if (matches && matches.length === 3) {
    const mime = matches[1];
    if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
    else if (mime.includes('webp')) ext = '.webp';
    else if (mime.includes('gif')) ext = '.gif';
    else if (mime.includes('svg')) ext = '.svg';
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(base64String, 'base64');
  }

  const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);
  return filename;
};

// Upload a single image (Admin)
exports.uploadSingleImage = async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ success: false, message: 'No image file or data provided.' });
    }

    // If an external URL is provided directly in body, reuse it
    if (req.body.image && (req.body.image.startsWith('http://') || req.body.image.startsWith('https://') || req.body.image.startsWith('/uploads/'))) {
      return res.json({
        success: true,
        url: req.body.image,
        filename: path.basename(req.body.image)
      });
    }

    let filename;
    if (req.file) {
      filename = req.file.filename;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      filename = saveBase64ToFile(req.body.image, 'img');
    } else {
      return res.status(400).json({ success: false, message: 'Invalid image format provided.' });
    }

    const fileUrl = getFileUrl(req, filename);

    return res.json({
      success: true,
      url: fileUrl,
      filename
    });
  } catch (error) {
    console.error('Upload single image error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Image upload failed.'
    });
  }
};

// Customer payment proof screenshot upload
exports.uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ success: false, message: 'No screenshot file provided.' });
    }

    if (req.body.image && (req.body.image.startsWith('http://') || req.body.image.startsWith('https://') || req.body.image.startsWith('/uploads/'))) {
      return res.json({
        success: true,
        url: req.body.image
      });
    }

    let filename;
    if (req.file) {
      filename = req.file.filename;
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      filename = saveBase64ToFile(req.body.image, 'payment');
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment screenshot format.' });
    }

    const fileUrl = getFileUrl(req, filename);

    return res.json({
      success: true,
      url: fileUrl,
      filename
    });
  } catch (error) {
    console.error('Payment proof upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Payment screenshot upload failed.'
    });
  }
};

// Upload multiple images
exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images provided.' });
    }

    const urls = req.files.map(file => getFileUrl(req, file.filename));

    return res.json({
      success: true,
      urls
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Multi-image upload failed.'
    });
  }
};
