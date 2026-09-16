const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const ensureSeedData = require('./config/ensureSeed');

// Route imports

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

const app = express();

// Try initial DB connection if MONGODB_URI is provided
if (process.env.MONGODB_URI) {
  connectDB().catch(err => {
    console.error('Initial DB connection attempt failed:', err.message);
  });
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for uploads (fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route (always available)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: process.env.MONGODB_URI ? 'configured' : 'not_configured',
    timestamp: new Date().toISOString()
  });
});

// Database connection middleware for API routes
app.use('/api', async (req, res, next) => {
  if (req.path === '/health') return next();

  if (!process.env.MONGODB_URI) {
    return res.status(503).json({
      success: false,
      message: 'Database not connected. Please set the MONGODB_URI environment variable in your Vercel project settings.'
    });
  }

  try {
    await connectDB();
    await ensureSeedData();
    next();
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: `Database connection error: ${error.message}`
    });
  }

});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

// Only listen when running as standalone server (not in Vercel serverless environment)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
}

module.exports = app;
