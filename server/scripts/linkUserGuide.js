const path = require('path');
console.log('Starting script...');
try {
    require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    console.log('Dotenv loaded. URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
} catch (e) {
    console.error('Dotenv error:', e);
}

const mongoose = require('mongoose');
console.log('Mongoose loaded');

try {
    const User = require('../models/User');
    console.log('User model loaded');
    const Guide = require('../models/Guide');
    console.log('Guide model loaded');
    const bcrypt = require('bcryptjs');
    console.log('Bcrypt loaded');

    const linkUserGuide = async () => {
        try {
            console.log('Connecting to MongoDB...');
            if (!process.env.MONGODB_URI) {
                throw new Error('MONGODB_URI is missing');
            }
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB');

            // 1. Find or Create a Test User
            let user = await User.findOne({ email: 'guide@test.com' });
            if (!user) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('password123', salt);
                user = await User.create({
                    name: 'Test Guide User',
                    email: 'guide@test.com',
                    password: hashedPassword,
                    role: 'user'
                });
                console.log('Created Test User: guide@test.com / password123');
            } else {
                console.log('Found Test User:', user.email);
            }

            // 2. Find or Create a Test Guide
            let guide = await Guide.findOne({ name: 'Test Guide Profile' });
            if (!guide) {
                guide = await Guide.create({
                    name: 'Test Guide Profile',
                    location: 'New York, USA',
                    languages: ['English', 'Spanish'],
                    description: 'Experienced guide.',
                    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
                    hourlyRate: 50,
                    rating: 5.0,
                    totalReviews: 10,
                    userId: user._id
                });
                console.log('Created Test Guide Profile linked to user');
            } else {
                guide.userId = user._id;
                await guide.save();
                console.log('Updated Guide Profile with User ID');
            }

            console.log('-----------------------------------');
            console.log('TEST DATA SETUP COMPLETE');
            console.log('User Email: guide@test.com');
            console.log('User Password: password123');
            console.log('Linked Guide: Test Guide Profile');
            console.log('-----------------------------------');

            process.exit(0);
        } catch (error) {
            console.error('Script logic error:', error);
            process.exit(1);
        }
    };

    linkUserGuide();

} catch (e) {
    console.error('Require error:', e);
}
