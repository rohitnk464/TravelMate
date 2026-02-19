const User = require('../models/User');
const Booking = require('../models/Booking');
const Guide = require('../models/Guide');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'USER' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all guides
// @route   GET /api/admin/guides
// @access  Private/Admin
const getGuides = async (req, res) => {
    try {
        const guides = await User.find({ role: 'GUIDE' }).select('-password');
        res.json(guides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a guide
// @route   PUT /api/admin/guides/:id/approve
// @access  Private/Admin
const approveGuide = async (req, res) => {
    try {
        const guideId = req.params.id;
        console.log(`Attempting to approve guide: ${guideId}`);

        const updateData = { isVerified: true };

        // Find user first to check role
        const guide = await User.findById(guideId);
        if (!guide) {
            console.log(`Guide not found: ${guideId}`);
            return res.status(404).json({ message: 'Guide not found' });
        }

        console.log(`Found user: ${guide.name}, Role: ${guide.role}`);

        const isGuide = guide.role.toUpperCase() === 'GUIDE' || guide.role.toLowerCase() === 'translator';

        if (isGuide) {
            if (guide.role.toLowerCase() === 'translator') {
                updateData.role = 'GUIDE';
            }

            // USE findByIdAndUpdate TO BYPASS PRE-SAVE HOOKS
            const updatedGuide = await User.findByIdAndUpdate(
                guideId,
                { $set: updateData },
                { new: true }
            );

            console.log(`Guide approved successfully: ${updatedGuide.email}`);
            res.json({ message: 'Guide approved', guide: updatedGuide });
        } else {
            console.log(`User is not a guide: ${guide.role}`);
            res.status(400).json({ message: `User role is ${guide.role}, not a guide.` });
        }
    } catch (error) {
        console.error('Approve Guide Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject/Delete user or guide
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active sharers
// @route   GET /api/admin/active-sharers
// @access  Private/Admin
const getActiveSharers = async (req, res) => {
    try {
        const sharers = await User.find({ isLocationSharing: true }).select('name email lastKnownLocation');
        res.json(sharers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'USER' });
        const totalGuides = await User.countDocuments({ role: 'GUIDE' });

        const revenueData = await Booking.aggregate([
            { $match: { $or: [{ status: 'COMPLETED' }, { paymentStatus: 'PAID' }] } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } } // Changed from amountPaid to totalPrice to be consistent
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        const cancellationData = await Booking.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    cancelled: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } }
                }
            }
        ]);
        const cancellationRate = cancellationData.length > 0 ? (cancellationData[0].cancelled / cancellationData[0].total) * 100 : 0;

        const cityData = await Booking.aggregate([
            { $match: { city: { $ne: null, $exists: true } } },
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        const mostBookedCity = (cityData.length > 0 && cityData[0]._id) ? cityData[0]._id : 'N/A';

        const topGuideData = await Booking.aggregate([
            { $match: { status: 'COMPLETED' } },
            { $group: { _id: '$guideId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        let topGuideName = 'N/A';
        if (topGuideData.length > 0) {
            const guideDoc = await Guide.findById(topGuideData[0]._id).populate('userId');
            if (guideDoc && guideDoc.userId) {
                topGuideName = guideDoc.userId.name;
            } else if (guideDoc) {
                topGuideName = guideDoc.name;
            }
        }

        res.json({
            totalBookings,
            totalUsers,
            totalGuides,
            totalRevenue,
            cancellationRate: cancellationRate.toFixed(1),
            mostBookedCity,
            topGuide: topGuideName
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email profileImage')
            .populate({
                path: 'guideId',
                populate: { path: 'userId', select: 'name email' }
            })
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUsers, getGuides, approveGuide, deleteUser, getActiveSharers, getAnalytics, getAllBookings };
