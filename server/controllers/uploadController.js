const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Convert a multer file (on disk) to a base64 data URI, then clean up
const fileToDataUri = (file) => {
  const filePath = path.join(uploadsDir, file.filename);
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString('base64');
  const mimeType = file.mimetype || 'image/png';
  // Clean up the temp file
  try { fs.unlinkSync(filePath); } catch (_) { /* ignore */ }
  return `data:${mimeType};base64,${base64}`;
};

// Upload a single image (Admin)
exports.uploadSingleImage = async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ success: false, message: 'No image file or data provided.' });
    }

    // If an external URL is provided directly in body, reuse it
    if (req.body.image && (req.body.image.startsWith('http://') || req.body.image.startsWith('https://'))) {
      return res.json({
        success: true,
        url: req.body.image,
        filename: path.basename(req.body.image)
      });
    }

    // If already a data URI, pass it through
    if (req.body.image && req.body.image.startsWith('data:')) {
      return res.json({
        success: true,
        url: req.body.image,
        filename: 'inline-image'
      });
    }

    let dataUri;
    if (req.file) {
      dataUri = fileToDataUri(req.file);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid image format provided.' });
    }

    return res.json({
      success: true,
      url: dataUri,
      filename: req.file.originalname || 'uploaded-image'
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

    if (req.body.image && (req.body.image.startsWith('http://') || req.body.image.startsWith('https://'))) {
      return res.json({
        success: true,
        url: req.body.image
      });
    }

    if (req.body.image && req.body.image.startsWith('data:')) {
      return res.json({
        success: true,
        url: req.body.image
      });
    }

    let dataUri;
    if (req.file) {
      dataUri = fileToDataUri(req.file);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment screenshot format.' });
    }

    return res.json({
      success: true,
      url: dataUri,
      filename: req.file.originalname || 'payment-proof'
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

    const urls = req.files.map(file => fileToDataUri(file));

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
