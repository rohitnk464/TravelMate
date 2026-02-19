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

const User = require('./models/User');

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const user = await User.findById('699577c6754e733bf19e87c6');
        if (user) {
            console.log('User ID:', user._id);
            console.log('Name:', user.name);
            console.log('Email:', user.email);
            console.log('Role:', user.role);
        } else {
            console.log('NOT FOUND');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUser();
