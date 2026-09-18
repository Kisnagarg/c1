const Settings = require('../models/Settings');

// Get business and payment settings (Public)
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('GetSettings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store settings.'
    });
  }
};

// Update business and payment settings (Admin)
exports.updateSettings = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      address,
      primaryPhone,
      secondaryPhone,
      whatsappNumber,
      email,
      upiId,
      upiQrImage,
      instagramUrl,
      instagramHandle,
      advanceAmount
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (businessName !== undefined) settings.businessName = businessName.trim();
    if (ownerName !== undefined) settings.ownerName = ownerName.trim();
    if (address !== undefined) settings.address = address.trim();
    if (primaryPhone !== undefined) settings.primaryPhone = primaryPhone.trim();
    if (secondaryPhone !== undefined) settings.secondaryPhone = secondaryPhone.trim();
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber.trim();
    if (email !== undefined) settings.email = email.trim();
    if (upiId !== undefined) settings.upiId = upiId.trim();
    if (upiQrImage !== undefined) settings.upiQrImage = upiQrImage.trim();
    if (instagramUrl !== undefined) settings.instagramUrl = instagramUrl.trim();
    if (instagramHandle !== undefined) settings.instagramHandle = instagramHandle.trim();
    if (advanceAmount !== undefined) settings.advanceAmount = Math.max(0, Number(advanceAmount));

    await settings.save();

    res.json({
      success: true,
      message: 'Business settings updated successfully.',
      settings
    });
  } catch (error) {
    console.error('UpdateSettings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update store settings.'
    });
  }
};
