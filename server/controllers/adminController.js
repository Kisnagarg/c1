const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Booking = require('../models/Booking');

// Dashboard statistics
exports.getStats = async (req, res) => {
  try {
    const [totalProducts, totalCategories, totalUsers, totalBookings, revenueResult, stockResult] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Product.aggregate([
        { $group: { _id: null, total: { $sum: '$stock' } } }
      ])
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Booking status distribution
    const statusDist = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: 'cancelled' } } },
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
        totalCategories,
        totalUsers,
        totalBookings,
        totalRevenue: revenueResult[0]?.total || 0,
        totalStock: stockResult[0]?.total || 0,
        recentBookings,
        statusDistribution: statusDist,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('GetStats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Booking.countDocuments(query)
    ]);

    res.json({
      success: true,
      bookings,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('GetAllBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const oldStatus = booking.status;

    // If cancelling, restore stock
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      for (const item of booking.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
          isAvailable: true
        });
      }
    }

    // If un-cancelling (re-activating), reduce stock again
    if (oldStatus === 'cancelled' && status !== 'cancelled') {
      for (const item of booking.items) {
        const product = await Product.findById(item.product);
        if (product && product.stock >= item.quantity) {
          product.stock -= item.quantity;
          if (product.stock === 0) product.isAvailable = false;
          await product.save();
        }
      }
    }

    booking.status = status;
    await booking.save();

    await booking.populate('user', 'name email phone');

    res.json({
      success: true,
      message: `Booking status updated to ${status}.`,
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

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify admin accounts.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully.`,
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
