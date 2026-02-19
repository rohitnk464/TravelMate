const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

try {
    const envConfig = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.warn('.env file not found');
}

const Booking = require('./models/Booking');
const User = require('./models/User');

async function checkAdminBookings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('\n--- Checking Global Admin Bookings ---');

        const bookings = await Booking.find()
            .populate('userId', 'name email')
            .populate({
                path: 'guideId',
                populate: { path: 'userId', select: 'name' }
            });

        console.log(`Total Bookings in Platform: ${bookings.length}`);

        if (bookings.length > 0) {
            // Check if they come from different users
            const users = new Set(bookings.map(b => b.userId?._id?.toString()));
            console.log(`Unique Travelers: ${users.size}`);

            bookings.slice(0, 5).forEach((b, i) => {
                console.log(`[${i + 1}] traveler: ${b.userId?.name} | guide: ${b.guideId?.userId?.name || b.guideId?.name} | city: ${b.city}`);
            });
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkAdminBookings();
