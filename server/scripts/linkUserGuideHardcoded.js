const mongoose = require('mongoose');
const SC_URI = 'mongodb://127.0.0.1:27017/travelmate';

const User = require('../models/User');
const Guide = require('../models/Guide');
const bcrypt = require('bcryptjs');

const linkUserGuide = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(SC_URI);
        console.log('Connected to MongoDB');

        // 1. Find or Create a Test User
        let user = await User.findOne({ email: 'guide@test.com' });
        if (!user) {
            console.log('Creating user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            try {
                user = await User.create({
                    name: 'Test Guide User',
                    email: 'guide@test.com',
                    password: hashedPassword,
                    role: 'traveler' // Matches enum
                });
                console.log('Created Test User: guide@test.com');
            } catch (err) {
                console.error('User creation failed:', err.message);
                // If unique error, try to fetch again?
                if (err.code === 11000) {
                    user = await User.findOne({ email: 'guide@test.com' });
                } else {
                    throw err;
                }
            }
        } else {
            console.log('Found Test User:', user.email);
        }

        if (!user) { throw new Error('User logic failed'); }

        // 2. Find or Create a Test Guide
        let guide = await Guide.findOne({ name: 'Test Guide Profile' });
        if (!guide) {
            console.log('Creating guide...');
            try {
                guide = await Guide.create({
                    name: 'Test Guide Profile',
                    location: 'New York, USA',
                    languages: ['English', 'Spanish'],
                    bio: 'Experienced guide.', // Changed from description
                    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
                    hourlyRate: 50,
                    rating: 5.0,
                    reviews: 10, // Changed from totalReviews
                    userId: user._id
                });
                console.log('Created Test Guide Profile linked to user');
            } catch (err) {
                console.error('Guide creation failed:', err.message, err.errors);
                throw err;
            }
        } else {
            guide.userId = user._id;
            await guide.save();
            console.log('Updated Guide Profile with User ID');
        }

        console.log('-----------------------------------');
        console.log('TEST DATA SETUP COMPLETE');
        process.exit(0);
    } catch (error) {
        console.error('Final Error:', error);
        process.exit(1);
    }
};

linkUserGuide();
