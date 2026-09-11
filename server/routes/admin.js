const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All admin routes require auth + admin role
router.use(auth, admin);

router.get('/stats', adminController.getStats);
router.get('/bookings', adminController.getAllBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.toggleUserStatus);
router.get('/users/:id/bookings', adminController.getUserBookings);

module.exports = router;
