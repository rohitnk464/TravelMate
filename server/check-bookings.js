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

async function checkBookings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const bookings = await Booking.find().sort({ createdAt: -1 }).limit(10);
        const data = bookings.map(b => ({
            id: b._id,
            status: b.status,
            date: b.date.toISOString(),
            time: b.time,
            userId: b.userId,
            guideId: b.guideId,
            createdAt: b.createdAt.toISOString()
        }));

        fs.writeFileSync('bookings_diag_v2.json', JSON.stringify(data, null, 2));
        console.log('Results written to bookings_diag_v2.json');

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkBookings();
