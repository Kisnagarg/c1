const Booking = require('../models/Booking');
const Product = require('../models/Product');

// Create a booking
exports.createBooking = async (req, res) => {
  try {
    const { items, phone } = req.body;

    // Validate customer phone number (mandatory)
    let customerPhone = req.user.phone;
    if ((!customerPhone || customerPhone.trim().length < 10) && phone && phone.trim().length >= 10) {
      req.user.phone = phone.trim();
      await req.user.save();
      customerPhone = req.user.phone;
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

    // Validate and prepare booking items
    const bookingItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          message: `Product not found: ${item.productId}` 
        });
      }

      if (!product.isAvailable) {
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
        image: product.image
      });

      totalAmount += product.price * item.quantity;

      // Decrease stock
      product.stock -= item.quantity;
      if (product.stock === 0) {
        product.isAvailable = false;
      }
      await product.save();
    }

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
      items: bookingItems,
      totalAmount,
      status: 'pending'
    });

    await booking.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      booking
    });
  } catch (error) {
    console.error('CreateBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error creating booking.' });
  }
};

// Get current user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
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
    const booking = await Booking.findOne({ 
      _id: req.params.id,
      user: req.user._id 
    }).populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('GetBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
