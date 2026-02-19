const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/reviews', bookingController.getAllReviews);

// Protected routes
router.post('/', protect, bookingController.createBooking);

// Get user bookings
router.get('/user/:userId', protect, bookingController.getUserBookings);

// Get guide bookings
router.get('/guide/:guideId', protect, bookingController.getGuideBookings);

// Update status
router.patch('/:id/status', protect, bookingController.updateStatus);

// Add review
router.post('/:id/review', protect, bookingController.addReview);

module.exports = router;
