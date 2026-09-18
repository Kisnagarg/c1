const cloudinary = require('cloudinary').v2;

// Configure Cloudinary from environment variables
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

// Upload a single image (Admin)
exports.uploadSingleImage = async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ success: false, message: 'No image file or data provided.' });
    }

    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (!isCloudinaryConfigured) {
      // If direct image URL provided in body, return it
      if (req.body.image && (req.body.image.startsWith('http://') || req.body.image.startsWith('https://'))) {
        return res.json({
          success: true,
          url: req.body.image,
          publicId: 'remote-url'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Cloudinary credentials are not set. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables, or enter an Image URL directly.'
      });
    }

    let uploadResult;
    const folderName = req.body.folder || 'rathore_electronics/cms';

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: folderName,
        resource_type: 'auto'
      });
    } else if (req.body.image) {
      uploadResult = await cloudinary.uploader.upload(req.body.image, {
        folder: folderName,
        resource_type: 'auto'
      });
    }

    return res.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
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

    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (!isCloudinaryConfigured) {
      if (req.body.image && (req.body.image.startsWith('http://') || req.body.image.startsWith('https://'))) {
        return res.json({
          success: true,
          url: req.body.image
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Cloudinary storage is not configured for image uploads.'
      });
    }

    let uploadResult;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: 'rathore_electronics/payments',
        resource_type: 'auto'
      });
    } else if (req.body.image) {
      uploadResult = await cloudinary.uploader.upload(req.body.image, {
        folder: 'rathore_electronics/payments',
        resource_type: 'auto'
      });
    }

    return res.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
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

    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (!isCloudinaryConfigured) {
      return res.status(400).json({
        success: false,
        message: 'Cloudinary credentials are not set.'
      });
    }

    const uploadPromises = req.files.map(file => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      return cloudinary.uploader.upload(dataURI, {
        folder: 'rathore_electronics/products',
        resource_type: 'auto'
      });
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.map(r => r.secure_url);

    return res.json({
      success: true,
      urls
    });
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Multi-image upload failed.'
    });
  }
};
