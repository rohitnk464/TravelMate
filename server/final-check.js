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
const Guide = require('./models/Guide');
const User = require('./models/User');

async function testFetch(userId) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findById(userId);

        console.log(`\nTesting for: ${user.name} (${user.role})`);

        // Simulating the combined fetch
        const travelerBookings = await Booking.find({ userId: userId }).populate('guideId').populate('userId', 'name');

        let guideBookings = [];
        if (user.role === 'GUIDE') {
            const guideProfile = await Guide.findOne({ userId: userId });
            if (guideProfile) {
                guideBookings = await Booking.find({ guideId: guideProfile._id }).populate('guideId').populate('userId', 'name');
            }
        }

        const combined = [...travelerBookings, ...guideBookings];
        console.log(`Total Bookings Fetched: ${combined.length}`);

        combined.forEach((b, i) => {
            const isPassenger = b.userId._id.toString() === userId.toString();
            const participantName = isPassenger ? b.guideId.name : b.userId.name;
            const context = isPassenger ? 'Traveler Trip' : 'Guide Work';
            console.log(`[${i + 1}] ${context} | Partner: ${participantName} | Status: ${b.status}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

// Check user 'misty'
testFetch('69957826754e733bf19e87de');
