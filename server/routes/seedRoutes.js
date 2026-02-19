const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const accounts = [
    { name: 'Admin User', email: 'admin@travelmate.com', password: 'Admin@123', role: 'ADMIN', isVerified: true },
    { name: 'Guide User', email: 'guide@travelmate.com', password: 'Guide@123', role: 'GUIDE', isVerified: true },
    { name: 'Test Traveler', email: 'user@travelmate.com', password: 'User@123', role: 'USER', isVerified: false },
];

router.get('/', async (req, res) => {
    try {
        const results = [];

        for (const acc of accounts) {
            let user = await User.findOne({ email: acc.email });

            if (user) {
                // Update existing user (fixes corrupted passwords)
                user.password = acc.password; // Plaintext, will be hashed by pre-save hook
                user.role = acc.role;
                user.isVerified = acc.isVerified;
                await user.save();
                results.push(`Updated: ${acc.email}`);
            } else {
                // Create new user
                await User.create(acc); // Plaintext, will be hashed by pre-save hook
                results.push(`Created: ${acc.email}`);
            }
        }

        res.json({
            message: "Database seeding completed.",
            details: results,
            credentials: {
                admin: "admin@travelmate.com / Admin@123",
                guide: "guide@travelmate.com / Guide@123",
                user: "user@travelmate.com / User@123"
            }
        });
    } catch (error) {
        console.error("Seeding Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
