const Booking = require('../models/Booking');
const Guide = require('../models/Guide');
const User = require('../models/User');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { userId, guideId, date, time, duration, message, totalPrice, city } = req.body;

        // Validation
        if (!userId || !guideId || !date || !time || !duration || !totalPrice || !city) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Strict Conflict Check: Guide cannot be double booked if status is ACCEPTED or COMPLETED
        const existingBooking = await Booking.findOne({
            guideId,
            date: new Date(date),
            time,
            status: { $in: ['ACCEPTED', 'COMPLETED'] }
        });

        if (existingBooking) {
            return res.status(409).json({ message: 'Guide is already occupied at this time' });
        }

        const newBooking = new Booking({
            userId,
            guideId,
            date: new Date(date),
            time,
            duration,
            message,
            totalPrice,
            city,
            status: 'PENDING'
        });

        await newBooking.save();

        // Add to guide's bookings
        await Guide.findByIdAndUpdate(guideId, { $push: { bookings: newBooking._id } });

        // Real-time notification
        const io = req.app.get('socketio');
        if (io) {
            io.emit('booking_created', {
                guideId,
                booking: newBooking
            });
        }

        res.status(201).json(newBooking);

    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get bookings for a user
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId })
            .populate('guideId', 'name location imageUrl')
            .sort({ date: -1 }); // Newest first
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get bookings for a guide
exports.getGuideBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ guideId: req.params.guideId })
            .populate('userId', 'name email profileImage')
            .sort({ date: 1 }); // Soonest first
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update booking status
// Update booking status
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name')
            .populate('guideId', 'name');

        if (!booking) {
            console.warn(`[Booking] Status update failed: Booking ${req.params.id} not found`);
            return res.status(404).json({ message: 'Booking not found' });
        }

        console.log(`[Booking] Status update request for ${booking._id}: ${booking.status} -> ${status}`);

        // If status is already the same, return current booking with success
        if (booking.status === status) {
            console.log(`[Booking] Status for ${booking._id} is already ${status}`);
            return res.json(booking);
        }

        // State Machine Validation
        const allowedTransitions = {
            'PENDING': ['ACCEPTED', 'REJECTED', 'CANCELLED'],
            'ACCEPTED': ['COMPLETED', 'CANCELLED'],
            'REJECTED': [],
            'CANCELLED': [],
            'COMPLETED': []
        };

        if (!allowedTransitions[booking.status] || !allowedTransitions[booking.status].includes(status)) {
            console.warn(`[Booking] Invalid transition: ${booking.status} to ${status}`);
            return res.status(400).json({
                message: `Cannot change status from ${booking.status} to ${status}`
            });
        }

        // Strict Conflict Check when Accepting
        if (status === 'ACCEPTED') {
            const conflict = await Booking.findOne({
                guideId: booking.guideId._id,
                date: booking.date,
                time: booking.time,
                status: { $in: ['ACCEPTED', 'COMPLETED'] },
                _id: { $ne: booking._id }
            });

            if (conflict) {
                console.warn(`[Booking] Conflict found for guide ${booking.guideId._id} at ${booking.date} ${booking.time}`);
                return res.status(409).json({ message: 'Guide is already occupied at this time' });
            }
        }

        booking.status = status;
        await booking.save();
        console.log(`[Booking] Status updated successfully for ${booking._id} to ${status}`);

        // Real-time notification to user
        const io = req.app.get('socketio');
        if (io) {
            io.emit('booking_status_updated', {
                bookingId: booking._id,
                userId: booking.userId._id,
                status,
                guideName: booking.guideId.name
            });
        }

        res.json(booking);
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Add review to a booking
exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Only completed bookings can be reviewed' });
        }

        if (booking.review && booking.review.rating) {
            return res.status(400).json({ message: 'Booking already has a review' });
        }

        // Add review to booking
        booking.review = {
            rating: Number(rating),
            comment,
            createdAt: new Date()
        };
        await booking.save();

        // Update Guide's aggregated rating
        const guide = await Guide.findById(booking.guideId);
        if (guide) {
            // Fetch all bookings for this guide that have reviews
            const ratedBookings = await Booking.find({
                guideId: booking.guideId,
                'review.rating': { $exists: true }
            });

            const totalReviews = ratedBookings.length;
            const averageRating = ratedBookings.reduce((sum, b) => sum + b.review.rating, 0) / totalReviews;

            guide.rating = Number(averageRating.toFixed(1));
            guide.reviews = totalReviews;
            await guide.save();
        }

        res.json(booking);
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Get all public reviews for landing page
exports.getAllReviews = async (req, res) => {
    try {
        const bookingsWithReviews = await Booking.find({
            'review.rating': { $exists: true }
        })
            .populate('userId', 'name profileImage email')
            .populate({
                path: 'guideId',
                select: 'name location'
            })
            .sort({ 'review.createdAt': -1 })
            .limit(10); // Show top 10 recent reviews

        const formattedReviews = bookingsWithReviews
            .filter(b => b.userId) // Ensure user still exists
            .map(b => ({
                id: b._id,
                name: b.userId.name,
                role: "Verified Traveler", // Default role
                location: b.guideId?.location || "Global Traveler",
                image: b.userId.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.userId.name)}&background=random`,
                text: b.review.comment,
                rating: b.review.rating,
                date: b.review.createdAt
            }));

        res.json(formattedReviews);
    } catch (error) {
        console.error('Get all reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
