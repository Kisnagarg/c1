const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;

// Check if Cloudinary credentials are provided
const isCloudinaryActive = () => {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
};

// Ensure Cloudinary is configured
const ensureCloudinaryConfig = () => {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
      api_key: process.env.CLOUDINARY_API_KEY.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
      secure: true,
    });
  }
};
ensureCloudinaryConfig();


// Local fallback uploads directory
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

/**
 * Upload a memory buffer to Cloudinary using upload_stream
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'rathore_electronics',
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Upload a base64 data URI directly to Cloudinary
 */
const uploadDataUriToCloudinary = (dataUri, options = {}) => {
  return cloudinary.uploader.upload(dataUri, {
    folder: 'rathore_electronics',
    resource_type: 'image',
    ...options,
  });
};

// Process an uploaded multer file, compress it with sharp, and save to Cloudinary or uploads/
const processUploadedFile = async (file, folder = 'rathore_electronics/products') => {
  const ext = '.jpg';
  const uniqueId = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const uniqueName = `${uniqueId}${ext}`;
  const srcPath = path.join(uploadsDir, file.filename);
  const destPath = path.join(uploadsDir, uniqueName);
  const clientDestPath = path.join(clientUploadsDir, uniqueName);

  let optimizedBuffer;
  try {
    const rawBuffer = fs.readFileSync(srcPath);
    try {
      optimizedBuffer = await sharp(rawBuffer)
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82 })
        .toBuffer();
    } catch (sharpErr) {
      console.warn('Sharp optimization warning, using raw buffer:', sharpErr.message);
      optimizedBuffer = rawBuffer;
    }

    // 1. Cloudinary Primary (Permanent Cloud Storage & Global CDN)
    if (isCloudinaryActive()) {
      try {
        const uploadRes = await uploadBufferToCloudinary(optimizedBuffer, {
          folder,
          public_id: uniqueId,
        });
        return uploadRes.secure_url;
      } catch (cloudErr) {
        console.error('Cloudinary upload failed, falling back to local storage:', cloudErr.message);
      }
    }

    // 2. Local Disk Fallback (if Cloudinary is unconfigured or failed)
    fs.writeFileSync(destPath, optimizedBuffer);
    if (!process.env.VERCEL) {
      try { fs.writeFileSync(clientDestPath, optimizedBuffer); } catch (_) {}
    }
    return `/uploads/${uniqueName}`;
  } finally {
    try { fs.unlinkSync(srcPath); } catch (_) { /* ignore */ }
  }
};

// Save a base64 data URI to Cloudinary or disk and return its URL
const saveDataUriToFile = async (dataUri, folder = 'rathore_electronics') => {
  if (!dataUri || !dataUri.startsWith('data:image')) return dataUri;
  const commaIdx = dataUri.indexOf(',');
  if (commaIdx === -1) return dataUri;

  // 1. Cloudinary Primary
  if (isCloudinaryActive()) {
    try {
      const uploadRes = await uploadDataUriToCloudinary(dataUri, { folder });
      return uploadRes.secure_url;
    } catch (cloudErr) {
      console.error('Cloudinary base64 upload failed, falling back to local file:', cloudErr.message);
    }
  }

  // 2. Local Fallback
  const base64Data = dataUri.substring(commaIdx + 1);
  const inputBuffer = Buffer.from(base64Data, 'base64');
  const uniqueName = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
  const destPath = path.join(uploadsDir, uniqueName);
  const clientDestPath = path.join(clientUploadsDir, uniqueName);

  try {
    const optimizedBuffer = await sharp(inputBuffer)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82 })
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

    // External URLs (e.g. Unsplash or Cloudinary) pass straight through
    if (req.body.image && (req.body.image.startsWith('http://') || req.body.image.startsWith('https://'))) {
      return res.json({
        success: true,
        url: req.body.image,
        filename: path.basename(req.body.image)
      });
    }

    // Base64 data URIs get uploaded to Cloudinary or disk
    if (req.body.image && req.body.image.startsWith('data:')) {
      const fileUrl = await saveDataUriToFile(req.body.image, 'rathore_electronics/products');
      return res.json({
        success: true,
        url: fileUrl,
        filename: path.basename(fileUrl)
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Invalid image format provided.' });
    }

    const fileUrl = await processUploadedFile(req.file, 'rathore_electronics/products');

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
      const fileUrl = await saveDataUriToFile(req.body.image, 'rathore_electronics/payments');
      return res.json({
        success: true,
        url: fileUrl
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Invalid payment screenshot format.' });
    }

    const fileUrl = await processUploadedFile(req.file, 'rathore_electronics/payments');

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

    const urls = await Promise.all(
      req.files.map(file => processUploadedFile(file, 'rathore_electronics/products'))
    );

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

// Check upload storage service status
exports.getUploadStatus = (req, res) => {
  const active = isCloudinaryActive();
  return res.json({
    success: true,
    storage: active ? 'cloudinary' : 'local',
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || (process.env.CLOUDINARY_URL ? 'configured' : null)
  });
};

// Test Cloudinary connection directly
exports.testCloudinary = async (req, res) => {
  try {
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config();
    } else if (process.env.CLOUDINARY_CLOUD_NAME) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        api_key: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.trim() : '',
        api_secret: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.trim() : '',
        secure: true,
      });
    }

    const testUpload = await cloudinary.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      { folder: 'rathore_electronics/test' }
    );

    return res.json({
      success: true,
      message: 'Cloudinary connected and uploaded test image successfully!',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: Boolean(process.env.CLOUDINARY_API_KEY),
      hasApiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
      hasUrl: Boolean(process.env.CLOUDINARY_URL),
      testUrl: testUpload.secure_url
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      http_code: err.http_code,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: Boolean(process.env.CLOUDINARY_API_KEY),
      hasApiSecret: Boolean(process.env.CLOUDINARY_API_SECRET),
      hasUrl: Boolean(process.env.CLOUDINARY_URL)
    });
  }
};

