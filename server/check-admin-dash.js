const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load .env
try {
    const dotenv = require('dotenv');
    dotenv.config();
} catch (e) {
    try {
        const envConfig = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    } catch (e2) { }
}

const Booking = require('./models/Booking');
const User = require('./models/User');
const Guide = require('./models/Guide');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travelmate');
        console.log('Connected to DB');

        const totalBookings = await Booking.countDocuments();
        console.log('Total Bookings:', totalBookings);

        const cityData = await Booking.aggregate([
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        console.log('City Data:', cityData);
        const mostBookedCity = cityData.length > 0 ? cityData[0]._id : 'N/A';
        console.log('Most Booked City:', mostBookedCity);

        const revenueData = await Booking.aggregate([
            { $match: { $or: [{ status: 'COMPLETED' }, { paymentStatus: 'PAID' }] } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        console.log('Revenue Data:', revenueData);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
