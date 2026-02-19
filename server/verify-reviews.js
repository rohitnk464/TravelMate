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

async function verifyReviews() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find or create an ACCEPTED booking
        let booking = await Booking.findOne({ status: 'ACCEPTED' });

        if (!booking) {
            console.log('No ACCEPTED booking found, creating one...');
            const traveler = await User.findOne({ role: 'USER' });
            const guideProfile = await Guide.findOne().populate('userId');

            if (!traveler || !guideProfile) {
                console.log('Need a traveler and a guide to run this test.');
                process.exit(1);
            }

            booking = new Booking({
                userId: traveler._id,
                guideId: guideProfile._id,
                date: new Date(),
                time: '14:00',
                duration: '1 Hour',
                totalPrice: 40,
                city: 'Test City',
                status: 'ACCEPTED'
            });
            await booking.save();
            console.log(`Created test booking: ${booking._id}`);
        } else {
            console.log(`Found ACCEPTED booking: ${booking._id}`);
        }

        // 2. Mark as COMPLETED
        booking.status = 'COMPLETED';
        await booking.save();
        console.log('Booking marked as COMPLETED');

        // 3. Add a review (Simulating backend logic)
        booking.review = {
            rating: 5,
            comment: 'Excellent guide! High Recommended.',
            createdAt: new Date()
        };
        await booking.save();
        console.log('Review added to booking');

        // Update Guide's aggregated rating (Logic from bookingController.js)
        const guideToUpdate = await Guide.findById(booking.guideId);
        if (guideToUpdate) {
            const ratedBookings = await Booking.find({
                guideId: booking.guideId,
                'review.rating': { $exists: true }
            });

            const totalReviews = ratedBookings.length;
            const averageRating = ratedBookings.reduce((sum, b) => sum + b.review.rating, 0) / totalReviews;

            guideToUpdate.rating = Number(averageRating.toFixed(1));
            guideToUpdate.reviews = totalReviews;
            await guideToUpdate.save();
            console.log('Guide ratings updated in DB');
        }

        // 4. Final verification
        const guide = await Guide.findById(booking.guideId);
        console.log(`\n--- Verification Results ---`);
        console.log(`Guide Rating: ${guide.rating}`);
        console.log(`Guide Total Reviews: ${guide.reviews}`);

        if (guide.reviews > 0 && guide.rating > 0) {
            console.log('\n✅ VERIFICATION SUCCESSFUL: Reviews and Guide stats are working correctly!');
        } else {
            console.log('\n❌ VERIFICATION FAILED: Stats were not updated.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Verification Error:', err);
        process.exit(1);
    }
}

verifyReviews();
