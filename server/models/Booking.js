const mongoose = require('mongoose');

const bookingItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: ''
  }
});

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerName: {
    type: String,
    trim: true,
    default: ''
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true,
    default: ''
  },
  shippingAddress: {
    type: String,
    trim: true,
    default: ''
  },
  items: [bookingItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  advanceAmount: {
    type: Number,
    required: true,
    default: 200,
    min: 0
  },
  remainingAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['awaiting_payment', 'pending_verification', 'verified', 'rejected'],
    default: 'awaiting_payment',
    index: true
  },
  orderStatus: {
    type: String,
    enum: [
      'awaiting_advance',
      'awaiting_verification',
      'confirmed',
      'processing',
      'shipped',
      'completed',
      'cancelled'
    ],
    default: 'awaiting_advance',
    index: true
  },
  // Backward compatible 'status' mapped to orderStatus
  status: {
    type: String,
    default: 'awaiting_advance'
  },
  upiTransactionId: {
    type: String,
    trim: true,
    default: ''
  },
  paymentScreenshot: {
    type: String,
    trim: true,
    default: ''
  },
  paymentSubmittedAt: {
    type: Date
  },
  paymentVerifiedAt: {
    type: Date
  },
  paymentVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: ''
  },
  adminNote: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Sync status with orderStatus pre-save
bookingSchema.pre('save', function(next) {
  if (this.isModified('orderStatus')) {
    this.status = this.orderStatus;
  } else if (this.isModified('status') && !this.isModified('orderStatus')) {
    this.orderStatus = this.status;
  }

  // Ensure remainingAmount is calculated properly
  if (this.totalAmount !== undefined && this.advanceAmount !== undefined) {
    this.remainingAmount = Math.max(0, this.totalAmount - this.advanceAmount);
  }

  next();
});

// Generate unique order/booking ID with prefix RE-
bookingSchema.statics.generateBookingId = function() {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'RE-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
