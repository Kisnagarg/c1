const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Booking = require('../models/Booking');

// Dashboard statistics
exports.getStats = async (req, res) => {
  try {
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCategories,
      totalUsers,
      totalBookings,
      pendingVerifications,
      awaitingAdvance,
      confirmedBookings,
      completedBookings,
      revenueResult,
      advanceCollectedResult,
      stockResult
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isAvailable: true, isActive: { $ne: false } }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
      Product.countDocuments({ stock: { $lte: 0 } }),
      Category.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.countDocuments(),
      Booking.countDocuments({ paymentStatus: 'pending_verification' }),
      Booking.countDocuments({ orderStatus: 'awaiting_advance' }),
      Booking.countDocuments({ orderStatus: 'confirmed' }),
      Booking.countDocuments({ orderStatus: 'completed' }),
      Booking.aggregate([
        { $match: { orderStatus: { $in: ['confirmed', 'processing', 'shipped', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'verified' } },
        { $group: { _id: null, total: { $sum: '$advanceAmount' } } }
      ]),
      Product.aggregate([
        { $group: { _id: null, total: { $sum: '$stock' } } }
      ])
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Booking status distribution
    const statusDist = await Booking.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    // Payment status distribution
    const paymentDist = await Booking.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo }, 
          orderStatus: { $in: ['confirmed', 'processing', 'shipped', 'completed'] } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        totalCategories,
        totalUsers,
        totalBookings,
        pendingVerifications,
        awaitingAdvance,
        confirmedBookings,
        completedBookings,
        totalRevenue: revenueResult[0]?.total || 0,
        totalAdvanceCollected: advanceCollectedResult[0]?.total || 0,
        totalStock: stockResult[0]?.total || 0,
        recentBookings,
        statusDistribution: statusDist,
        paymentDistribution: paymentDist,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('GetStats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all bookings (admin) with robust search and filters
exports.getAllBookings = async (req, res) => {
  try {
    const { 
      status, 
      orderStatus, 
      paymentStatus, 
      search, 
      dateFrom, 
      dateTo, 
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};

    // Order status filter
    if (orderStatus) {
      query.orderStatus = orderStatus;
    } else if (status) {
      query.$or = [{ orderStatus: status }, { status: status }];
    }

    // Payment status filter
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Search by booking ID, customer phone, or UPI transaction ID
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { bookingId: searchRegex },
        { customerPhone: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { upiTransactionId: searchRegex }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total, pendingVerificationsCount] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .populate('paymentVerifiedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Booking.countDocuments(query),
      Booking.countDocuments({ paymentStatus: 'pending_verification' })
    ]);

    res.json({
      success: true,
      bookings,
      pendingVerificationsCount,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('GetAllBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Verify ₹200 UPI Payment (Admin)
exports.verifyPayment = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    booking.paymentStatus = 'verified';
    booking.orderStatus = 'confirmed';
    booking.paymentVerifiedAt = new Date();
    booking.paymentVerifiedBy = req.user._id;
    booking.rejectionReason = '';
    if (adminNote) {
      booking.adminNote = adminNote.trim();
    }

    await booking.save();
    await booking.populate('user', 'name email phone');
    await booking.populate('paymentVerifiedBy', 'name email');

    res.json({
      success: true,
      message: `Advance payment verified. Order #${booking.bookingId} is now CONFIRMED.`,
      booking
    });
  } catch (error) {
    console.error('VerifyPayment error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying payment.' });
  }
};

// Reject UPI Payment (Admin)
exports.rejectPayment = async (req, res) => {
  try {
    const { reason, adminNote } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    booking.paymentStatus = 'rejected';
    booking.orderStatus = 'awaiting_advance';
    booking.rejectionReason = reason ? reason.trim() : 'Invalid or unverified UPI transaction details.';
    if (adminNote) {
      booking.adminNote = adminNote.trim();
    }

    await booking.save();
    await booking.populate('user', 'name email phone');

    res.json({
      success: true,
      message: `Payment rejected for Order #${booking.bookingId}. Customer can re-submit valid UPI details.`,
      booking
    });
  } catch (error) {
    console.error('RejectPayment error:', error);
    res.status(500).json({ success: false, message: 'Server error rejecting payment.' });
  }
};

// Update booking / order status (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, orderStatus, adminNote } = req.body;
    const targetStatus = orderStatus || status;
    const validStatuses = [
      'awaiting_advance',
      'awaiting_verification',
      'confirmed',
      'processing',
      'shipped',
      'ready',
      'completed',
      'cancelled'
    ];
    
    if (!validStatuses.includes(targetStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const oldStatus = booking.orderStatus;

    // If cancelling, restore stock
    if (targetStatus === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of booking.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
            isAvailable: true
          });
        }
      }
    }

    // If un-cancelling (re-activating), reduce stock again
    if (oldStatus === 'cancelled' && targetStatus !== 'cancelled') {
      for (const item of booking.items) {
        if (item.product) {
          const product = await Product.findById(item.product);
          if (product && product.stock >= item.quantity) {
            product.stock -= item.quantity;
            if (product.stock === 0) product.isAvailable = false;
            await product.save();
          }
        }
      }
    }

    booking.orderStatus = targetStatus;
    booking.status = targetStatus;
    if (adminNote) booking.adminNote = adminNote.trim();

    await booking.save();
    await booking.populate('user', 'name email phone');
    await booking.populate('paymentVerifiedBy', 'name email');

    res.json({
      success: true,
      message: `Order #${booking.bookingId} status updated to ${targetStatus}.`,
      booking
    });
  } catch (error) {
    console.error('UpdateBookingStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all users (admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .lean();

    // Get booking counts for each user
    const userIds = users.map(u => u._id);
    const bookingCounts = await Booking.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } }
    ]);

    const bookingMap = {};
    bookingCounts.forEach(b => { 
      bookingMap[b._id.toString()] = { count: b.count, totalSpent: b.totalSpent }; 
    });

    const result = users.map(u => ({
      ...u,
      bookingCount: bookingMap[u._id.toString()]?.count || 0,
      totalSpent: bookingMap[u._id.toString()]?.totalSpent || 0
    }));

    res.json({ success: true, users: result });
  } catch (error) {
    console.error('GetUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Toggle user active status or update details (admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify admin accounts.' });
    }

    if (req.body && req.body.phone !== undefined) {
      user.phone = req.body.phone.trim();
    }
    if (req.body && req.body.name) {
      user.name = req.body.name.trim();
    }
    if (req.body && typeof req.body.isActive === 'boolean') {
      user.isActive = req.body.isActive;
    } else if (!req.body || req.body.toggleStatus || Object.keys(req.body).length === 0) {
      user.isActive = !user.isActive;
    }

    await user.save();

    res.json({
      success: true,
      message: `Customer profile updated successfully.`,
      user
    });
  } catch (error) {
    console.error('ToggleUserStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get user bookings (admin view)
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('GetUserBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
