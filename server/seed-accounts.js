require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const accounts = [
    { name: 'Admin User', email: 'admin@travelmate.com', password: 'Admin@123', role: 'ADMIN', isVerified: true },
    { name: 'Guide User', email: 'guide@travelmate.com', password: 'Guide@123', role: 'GUIDE', isVerified: true },
    { name: 'Test Traveler', email: 'user@travelmate.com', password: 'User@123', role: 'USER', isVerified: false },
];

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const acc of accounts) {
        const existing = await User.findOne({ email: acc.email });
        if (existing) {
            console.log(`Already exists: ${acc.email} (${acc.role})`);
            continue;
        }
        const hashed = await bcrypt.hash(acc.password, 10);
        await User.create({ ...acc, password: hashed });
        console.log(`Created: ${acc.email} (${acc.role})`);
    }

    console.log('\n--- Login Credentials ---');
    console.log('ADMIN  -> admin@travelmate.com / Admin@123');
    console.log('GUIDE  -> guide@travelmate.com / Guide@123');
    console.log('USER   -> user@travelmate.com  / User@123');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
