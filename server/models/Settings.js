const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true,
    default: 'Rathore Electronics'
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
    default: 'Mahendra Rathore'
  },
  address: {
    type: String,
    required: true,
    trim: true,
    default: 'Main Bus Stand, Atari Khejda, Vidisha, Madhya Pradesh'
  },
  primaryPhone: {
    type: String,
    required: true,
    trim: true,
    default: '8435930113'
  },
  secondaryPhone: {
    type: String,
    trim: true,
    default: '7067586087'
  },
  whatsappNumber: {
    type: String,
    trim: true,
    default: '8435930113'
  },
  email: {
    type: String,
    trim: true,
    default: 'mrathore4440@gmail.com'
  },
  upiId: {
    type: String,
    required: true,
    trim: true,
    default: '7067586097-2@axl'
  },
  upiQrImage: {
    type: String,
    trim: true,
    default: '/phonepe-qr.png'
  },
  logo: {
    type: String,
    trim: true,
    default: '/logo.jpg'
  },
  instagramUrl: {
    type: String,
    trim: true,
    default: 'https://www.instagram.com/rathore_electronics_/'
  },
  instagramHandle: {
    type: String,
    trim: true,
    default: '@rathore_electronics_'
  },
  advanceAmount: {
    type: Number,
    required: true,
    default: 200,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  }
}, {
  timestamps: true
});

// Helper static method to get or initialize default settings singleton
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      businessName: 'Rathore Electronics',
      ownerName: 'Mahendra Rathore',
      address: 'Main Bus Stand, Atari Khejda, Vidisha, Madhya Pradesh',
      primaryPhone: '8435930113',
      secondaryPhone: '7067586087',
      whatsappNumber: '8435930113',
      email: 'mrathore4440@gmail.com',
      upiId: '7067586097-2@axl',
      upiQrImage: '/phonepe-qr.png',
      logo: '/logo.jpg',
      instagramUrl: 'https://www.instagram.com/rathore_electronics_/',
      instagramHandle: '@rathore_electronics_',
      advanceAmount: 200,
      currency: 'INR'
    });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
