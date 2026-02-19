const mongoose = require('mongoose');
const Message = require('./models/Message');
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

async function checkMessage() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const msg = await Message.findOne({ content: "Hello Guide! 🚀" }).sort({ timestamp: -1 });
    if (msg) {
        console.log("✅ Message Found in DB:", msg);
    } else {
        console.log("❌ Message NOT Found in DB");
    }
    await mongoose.disconnect();
}

checkMessage();
