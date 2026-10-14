const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const uploadsDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', 'uploads');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (_) {}

// Client uploads mirror directory for seamless Vite dev and static serving
const clientUploadsDir = path.join(__dirname, '..', '..', 'client', 'public', 'uploads');
try {
  if (!process.env.VERCEL && !fs.existsSync(clientUploadsDir)) {
    fs.mkdirSync(clientUploadsDir, { recursive: true });
  }
} catch (_) {}

// Process an uploaded multer file, compress it with sharp, and save to uploads/
const processUploadedFile = async (file) => {
  const ext = '.jpg';
  const uniqueName = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const srcPath = path.join(uploadsDir, file.filename);
  const destPath = path.join(uploadsDir, uniqueName);
  const clientDestPath = path.join(clientUploadsDir, uniqueName);

  try {
    const buffer = fs.readFileSync(srcPath);
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    fs.writeFileSync(destPath, optimizedBuffer);
    if (!process.env.VERCEL) {
      try { fs.writeFileSync(clientDestPath, optimizedBuffer); } catch (_) {}
    }
    return `/uploads/${uniqueName}`;
  } catch (err) {
    console.error('Sharp optimization failed, using original file:', err.message);
    const originalBuffer = fs.readFileSync(srcPath);
    fs.writeFileSync(destPath, originalBuffer);
    if (!process.env.VERCEL) {
      try { fs.writeFileSync(clientDestPath, originalBuffer); } catch (_) {}
    }
    return `/uploads/${uniqueName}`;
  } finally {
    try { fs.unlinkSync(srcPath); } catch (_) { /* ignore */ }
  }
};

// Save a base64 data URI to a static file on disk and return its /uploads/ URL
const saveDataUriToFile = async (dataUri) => {
  if (!dataUri || !dataUri.startsWith('data:image')) return dataUri;
  const commaIdx = dataUri.indexOf(',');
  if (commaIdx === -1) return dataUri;

  const base64Data = dataUri.substring(commaIdx + 1);
  const inputBuffer = Buffer.from(base64Data, 'base64');
  const uniqueName = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
  const destPath = path.join(uploadsDir, uniqueName);
  const clientDestPath = path.join(clientUploadsDir, uniqueName);

  try {
    const optimizedBuffer = await sharp(inputBuffer)
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    fs.writeFileSync(destPath, optimizedBuffer);
    if (!process.env.VERCEL) {
      try { fs.writeFileSync(clientDestPath, optimizedBuffer); } catch (_) {}
    }
  } catch (err) {
    fs.writeFileSync(destPath, inputBuffer);
    if (!process.env.VERCEL) {
      try { fs.writeFileSync(clientDestPath, inputBuffer); } catch (_) {}
    }
  }

  return `/uploads/${uniqueName}`;
};

// Upload a single image (Admin)
exports.uploadSingleImage = async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ success: false, message: 'No image file or data provided.' });
    }

    // External URLs (e.g. Unsplash) pass straight through
    if (req.body.image && (req.body.image.startsWith('http://') || req.body.image.startsWith('https://'))) {
      return res.json({
        success: true,
        url: req.body.image,
        filename: path.basename(req.body.image)
      });
    }

    // Base64 data URIs get extracted to static files
    if (req.body.image && req.body.image.startsWith('data:')) {
      const fileUrl = await saveDataUriToFile(req.body.image);
      return res.json({
        success: true,
        url: fileUrl,
        filename: path.basename(fileUrl)
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Invalid image format provided.' });
    }

    const fileUrl = await processUploadedFile(req.file);

    return res.json({
      success: true,
      url: fileUrl,
      filename: path.basename(fileUrl)
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
      const fileUrl = await saveDataUriToFile(req.body.image);
      return res.json({
        success: true,
        url: fileUrl
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Invalid payment screenshot format.' });
    }

    const fileUrl = await processUploadedFile(req.file);

    return res.json({
      success: true,
      url: fileUrl,
      filename: path.basename(fileUrl)
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

    const urls = await Promise.all(req.files.map(file => processUploadedFile(file)));

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
