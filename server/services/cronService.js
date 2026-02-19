const cron = require('node-cron');
const Booking = require('../models/Booking');

const initCronJobs = (io) => {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        console.log('⏰ Running auto-cancel cron job...');
        try {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

            const expiredBookings = await Booking.find({
                status: 'PENDING',
                createdAt: { $lt: twoHoursAgo }
            }).populate('userId guideId');

            if (expiredBookings.length === 0) return;

            console.log(`Found ${expiredBookings.length} expired bookings.`);

            for (const booking of expiredBookings) {
                booking.status = 'CANCELLED';
                await booking.save();

                // Notify User via Socket.io
                if (io) {
                    io.to(booking.userId._id.toString()).emit('booking_status_updated', {
                        bookingId: booking._id,
                        status: 'CANCELLED',
                        message: 'Booking auto-cancelled due to timeout.'
                    });
                }
            }
            console.log('✅ Expired bookings cancelled.');
        } catch (error) {
            console.error('Cron job error:', error);
        }
    });
};

module.exports = initCronJobs;
