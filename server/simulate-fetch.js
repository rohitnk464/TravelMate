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

async function simulateFetch(userId) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log(`\n--- Simulating fetch for User ID: ${userId} ---`);

        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return;
        }
        console.log(`User: ${user.name}, Role: ${user.role}`);

        // 1. Fetch as Traveler
        const travelerBookings = await Booking.find({ userId: userId })
            .populate('guideId')
            .populate('userId', 'name email profileImage');
        console.log(`Found as Traveler: ${travelerBookings.length}`);

        // 2. Fetch as Guide
        let guideBookings = [];
        if (user.role === 'GUIDE') {
            const guideProfile = await Guide.findOne({ userId: userId });
            if (guideProfile) {
                console.log(`Guide Profile ID: ${guideProfile._id}`);
                guideBookings = await Booking.find({ guideId: guideProfile._id })
                    .populate('guideId')
                    .populate('userId', 'name email profileImage');
                console.log(`Found as Guide: ${guideBookings.length}`);
            }
        }

        const combined = [...travelerBookings, ...guideBookings];
        console.log(`Combined Total: ${combined.length}`);

        if (combined.length > 0) {
            const first = combined[0];
            const isPassenger = first.userId._id.toString() === userId.toString();
            const participant = isPassenger ? first.guideId : first.userId;
            console.log(`Example Booking Participant Name: ${participant.name}`);
            console.log(`Is Passenger: ${isPassenger}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

// User 'misty' (Guide)
simulateFetch('69957826754e733bf19e87de');
