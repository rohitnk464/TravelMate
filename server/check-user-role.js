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

async function checkUser() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'guide@test.com' });
    if (user) {
        console.log('User found:', user.email);
        console.log(`Role: '${user.role}' (Length: ${user.role.length})`);
        for (let i = 0; i < user.role.length; i++) {
            console.log(`Char ${i}: ${user.role.charCodeAt(i)}`);
        }
        console.log('Is Valid:', ['USER', 'GUIDE', 'ADMIN'].includes(user.role));
    } else {
        console.log('User guide@test.com not found');
        const firstUser = await User.findOne();
        if (firstUser) {
            console.log('First User found:', firstUser.email);
            console.log('Role:', firstUser.role);
        }
    }
    await mongoose.disconnect();
}

checkUser();
