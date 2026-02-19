const Booking = require('../models/Booking');
const Guide = require('../models/Guide');
const User = require('../models/User');

// @desc    Process a demo payment
// @route   POST /api/payment/demo
// @access  Private
exports.processDemoPayment = async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ message: 'Missing bookingId or amount' });
        }

        const booking = await Booking.findById(bookingId).populate('userId', 'name').populate('guideId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.paymentStatus === 'PAID') {
            return res.status(400).json({ message: 'Booking is already paid' });
        }

        const guide = await Guide.findById(booking.guideId._id);
        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }

        // --- CONFLICT CHECK ---
        // Check if guide is already occupied at this same date and time with an APPROVED booking
        const overlappingBooking = await Booking.findOne({
            _id: { $ne: bookingId }, // Exclude current booking
            guideId: booking.guideId._id,
            date: booking.date,
            time: booking.time,
            status: { $in: ['ACCEPTED', 'COMPLETED'] }, // Consider accepted bookings as "occupied"
            paymentStatus: 'PAID'
        });

        if (overlappingBooking) {
            return res.status(409).json({ message: 'Guide is already occupied at this time' });
        }

        // --- UPDATE BOOKING ---
        booking.status = 'ACCEPTED';
        booking.paymentStatus = 'PAID';
        booking.paymentId = 'DEMO_PAY_' + Math.random().toString(36).substring(2, 9).toUpperCase();
        booking.amountPaid = amount;
        await booking.save();

        // --- UPDATE GUIDE EARNINGS ---
        guide.totalEarnings = (guide.totalEarnings || 0) + Number(amount);
        guide.completedBookings = (guide.completedBookings || 0) + 1;
        await guide.save();

        // --- NOTIFICATIONS ---
        const io = req.app.get('socketio');
        if (io) {
            // Notify Guide
            io.to(guide.userId.toString()).emit('new_notification', {
                type: 'BOOKING_CONFIRMED',
                message: `New confirmed booking from ${booking.userId.name}! Earnings: $${amount}`,
                data: { bookingId: booking._id }
            });

            // Notify User
            io.to(booking.userId._id.toString()).emit('new_notification', {
                type: 'PAYMENT_SUCCESS',
                message: `Payment successful for your booking with ${guide.name}!`,
                data: { bookingId: booking._id, paymentId: booking.paymentId }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                paymentId: booking.paymentId,
                status: booking.status,
                paymentStatus: booking.paymentStatus
            }
        });

    } catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ message: 'Server error during payment simulation' });
    }
};
