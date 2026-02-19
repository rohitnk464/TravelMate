const Guide = require('../models/Guide');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get current guide profile
// @route   GET /api/guides/me
// @access  Private/Guide
exports.getMyProfile = async (req, res) => {
    try {
        const guide = await Guide.findOne({ userId: req.user.id });
        if (!guide) {
            return res.status(404).json({ message: 'Guide profile not found' });
        }
        res.json(guide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or update guide profile
// @route   POST /api/guides
// @access  Private/Guide
exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { name, location, languages, bio, hourlyRate, imageUrl } = req.body;

        const languagesArray = languages
            ? (typeof languages === 'string' ? languages.split(',').map(s => s.trim()) : languages)
            : [];

        const guideFields = {
            userId: req.user.id,
            name: name || req.user.name,
            location,
            languages: languagesArray,
            bio,
            hourlyRate,
            imageUrl: req.file ? `http://localhost:5000/uploads/${req.file.filename}` : imageUrl
        };

        let guide = await Guide.findOne({ userId: req.user.id });

        if (guide) {
            // Update
            guide = await Guide.findOneAndUpdate(
                { userId: req.user.id },
                { $set: guideFields },
                { new: true }
            );
            return res.json(guide);
        }

        // Create
        guide = new Guide(guideFields);
        await guide.save();
        res.status(201).json(guide);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all guides (Public)
// @route   GET /api/guides
// @access  Public
// @desc    Get guide earnings and stats
// @route   GET /api/guides/earnings
// @access  Private/Guide
exports.getEarnings = async (req, res) => {
    try {
        const guide = await Guide.findOne({ userId: req.user.id });
        if (!guide) {
            return res.status(404).json({ message: 'Guide profile not found' });
        }

        const totalBookings = await Booking.countDocuments({ guideId: guide._id });
        const completedBookings = await Booking.countDocuments({ guideId: guide._id, status: 'COMPLETED' });
        const pendingBookings = await Booking.countDocuments({ guideId: guide._id, status: 'PENDING' });
        const cancelledBookings = await Booking.countDocuments({ guideId: guide._id, status: 'CANCELLED' });

        const totalEarningsData = await Booking.aggregate([
            { $match: { guideId: guide._id, status: 'COMPLETED' } },
            { $group: { _id: null, total: { $sum: '$amountPaid' } } }
        ]);
        const totalEarnings = totalEarningsData.length > 0 ? totalEarningsData[0].total : 0;

        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

        const monthlyEarningsData = await Booking.aggregate([
            {
                $match: {
                    guideId: guide._id,
                    status: 'COMPLETED',
                    createdAt: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$amountPaid' } } }
        ]);
        const monthlyEarnings = monthlyEarningsData.length > 0 ? monthlyEarningsData[0].total : 0;

        const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0;

        // Monthly Earnings Trend (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const earningsTrendData = await Booking.aggregate([
            {
                $match: {
                    guideId: guide._id,
                    paymentStatus: 'PAID', // Use PAID status for earnings
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$amountPaid" }
                }
            }
        ]);

        // Fill in missing months
        const earningsTrend = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthNum = d.getMonth() + 1; // 1-12

            const found = earningsTrendData.find(item => item._id === monthNum);
            earningsTrend.push({
                _id: monthNum,
                total: found ? found.total : 0,
                label: d.toLocaleString('default', { month: 'short' })
            });
        }

        res.json({
            totalBookings,
            completedBookings,
            pendingBookings,
            totalEarnings,
            monthlyEarnings,
            cancellationRate,
            earningsTrend
        });

    } catch (error) {
        console.error('Get Earnings Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getGuides = async (req, res) => {
    try {
        const guides = await Guide.find().sort({ rating: -1 });
        res.json(guides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
