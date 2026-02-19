const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');

try {
    const envConfig = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
} catch (e) {
    console.warn('.env file not found');
}

async function fixRoles() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fix guide@test.com
    const guide = await User.findOne({ email: 'guide@test.com' });
    if (guide) {
        console.log(`Found guide@test.com with role: '${guide.role}'`);
        guide.role = 'GUIDE';
        // We use updateOne because .save() might trigger other validations or hooks we want to avoid for now, 
        // though .save() is better to ensure validity. 
        // Let's try updateOne to bypass validation first, or just save.
        // If I use save(), I need to make sure other fields are valid.
        // Let's use updateOne to be safe and fast.
        await User.updateOne({ _id: guide._id }, { $set: { role: 'GUIDE' } });
        console.log('Updated guide@test.com role to GUIDE');
    }

    // Fix any 'traveler' to 'USER'
    const travelers = await User.find({ role: 'traveler' }); // Exact string match might not work if there are hidden chars
    // Let's find all users and check manually
    const allUsers = await User.find({});
    for (const u of allUsers) {
        if (!['USER', 'GUIDE', 'ADMIN'].includes(u.role)) {
            console.log(`User ${u.email} has invalid role: '${u.role}'`);
            let newRole = 'USER';
            if (u.role.toLowerCase().includes('guide')) newRole = 'GUIDE';
            if (u.role.toLowerCase().includes('admin')) newRole = 'ADMIN';

            await User.updateOne({ _id: u._id }, { $set: { role: newRole } });
            console.log(`Updated ${u.email} role to ${newRole}`);
        }
    }

    await mongoose.disconnect();
}

fixRoles();
