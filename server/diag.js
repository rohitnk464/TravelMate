const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const checkUsers = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);

        // Define model inline to avoid path issues
        const UserSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const users = await User.find({}).lean();
        console.log('\n--- Database Users ---');
        users.forEach(u => {
            console.log(`ID: ${u._id} | Role: ${u.role} | Verified: ${u.isVerified} | Name: ${u.name}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Diagnostic Error:', error);
    }
};

checkUsers();
