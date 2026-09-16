const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// All booking routes require authentication
router.post('/', auth, bookingController.createBooking);
router.get('/my', auth, bookingController.getMyBookings);
router.get('/:id', auth, bookingController.getBooking);

module.exports = router;
