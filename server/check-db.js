const mongoose = require('mongoose');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = require('./models/User');
        const users = await User.find({}, 'name email role isVerified');
        console.log('--- Current Users ---');
        users.forEach(u => {
            console.log(`[${u.role}] ${u.name} (${u.email}) - Verified: ${u.isVerified}`);
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUsers();
