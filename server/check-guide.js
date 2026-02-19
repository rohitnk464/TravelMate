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

const Guide = require('./models/Guide');

async function checkGuide() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const guide = await Guide.findById('69957feee8c683d2a0ff1346');
        console.log('Guide Found:', guide ? 'YES' : 'NO');
        if (guide) {
            console.log('Name:', guide.name);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkGuide();
