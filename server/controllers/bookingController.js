const Booking = require('../models/Booking');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

// Create a booking / order with ₹200 Advance Payment requirement
exports.createBooking = async (req, res) => {
  try {
    const { items, phone, name, address, notes } = req.body;

    // Validate customer phone number (mandatory)
    let customerPhone = phone || req.user.phone;
    if (phone && phone.trim().length >= 10 && (!req.user.phone || req.user.phone !== phone.trim())) {
      req.user.phone = phone.trim();
      await req.user.save();
    }

    if (!customerPhone || customerPhone.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer phone number is mandatory (min. 10 digits) to complete booking.' 
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required.' });
    }

    // Fetch dynamic store settings for advance payment amount
    const settings = await Settings.getSettings();
    const advanceAmount = Number(settings.advanceAmount) || 200;

    // Validate and prepare booking items
    const bookingItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          message: `Product not found: ${item.productId || item.product}` 
        });
      }

      if (!product.isAvailable || product.isActive === false) {
        return res.status(400).json({ 
          success: false, 
          message: `${product.name} is currently unavailable.` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      bookingItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image || (product.images && product.images[0]) || ''
      });

      totalAmount += product.price * item.quantity;

      // Decrease stock immediately upon order placement
      product.stock -= item.quantity;
      if (product.stock === 0) {
        product.isAvailable = false;
      }
      await product.save();
    }

    // Remaining amount after advance
    const remainingAmount = Math.max(0, totalAmount - advanceAmount);

    // Generate unique booking ID
    let bookingId;
    let isUnique = false;
    while (!isUnique) {
      bookingId = Booking.generateBookingId();
      const existing = await Booking.findOne({ bookingId });
      if (!existing) isUnique = true;
    }

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      customerName: name || req.user.name || '',
      customerPhone: customerPhone.trim(),
      customerEmail: req.user.email || '',
      shippingAddress: address || '',
      items: bookingItems,
      totalAmount,
      advanceAmount,
      remainingAmount,
      orderStatus: 'awaiting_advance',
      paymentStatus: 'awaiting_payment',
      notes: notes || ''
    });

    await booking.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Order created successfully! Please complete the ₹200 advance payment.',
      booking
    });
  } catch (error) {
    console.error('CreateBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error creating booking.' });
  }
};

// Submit UPI payment details by customer
exports.submitPayment = async (req, res) => {
  try {
    const { upiTransactionId, paymentScreenshot } = req.body;

    if (!upiTransactionId || !upiTransactionId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'UPI Transaction ID / UTR number is required.'
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (booking.paymentStatus === 'verified') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment has already been verified for this order.' 
      });
    }

    // Update payment details - awaiting manual admin verification
    booking.upiTransactionId = upiTransactionId.trim();
    if (paymentScreenshot) {
      booking.paymentScreenshot = paymentScreenshot.trim();
    }
    booking.paymentSubmittedAt = new Date();
    booking.paymentStatus = 'pending_verification';
    booking.orderStatus = 'awaiting_verification';
    booking.rejectionReason = '';

    await booking.save();
    await booking.populate('user', 'name email phone');

    res.json({
      success: true,
      message: 'Payment details submitted successfully. Your payment will be verified by the shop.',
      booking
    });
  } catch (error) {
    console.error('SubmitPayment error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting payment.' });
  }
};

// Get current user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('GetMyBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get single booking detail
exports.getBooking = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    // If not admin, restrict to owner user
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const booking = await Booking.findOne(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug price image');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('GetBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
