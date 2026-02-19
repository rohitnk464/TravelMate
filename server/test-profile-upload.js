const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');

// Load .env
try {
    const envConfig = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
} catch (e) {
    console.warn('.env file not found');
}

async function testUpload() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get a user
        const user = await User.findOne();
        if (!user) {
            console.error('No users found to test with.');
            process.exit(1);
        }
        console.log(`Testing with user: ${user.email} (${user._id})`);

        // 2. Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // 3. Create dummy image
        const dummyPath = path.join(__dirname, 'test-image.png');
        // Create a simple 1x1 PNG or just some bytes
        fs.writeFileSync(dummyPath, Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2d0b0000000049454e44ae426082', 'hex'));

        // 4. Send Request
        const form = new FormData();
        form.append('name', user.name);
        form.append('image', fs.createReadStream(dummyPath));

        console.log('Sending upload request...');
        const response = await axios.put('http://localhost:5000/api/auth/profile', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Upload Status:', response.status);
        console.log('Response Data:', response.data);

        // Verification
        if (response.data.profileImage && response.data.profileImage.startsWith('/uploads/')) {
            console.log('✅ SUCCESS: Profile image updated correctly.');
        } else {
            console.log('❌ FAILURE: Profile image path not returned or incorrect.');
        }

        // Cleanup
        if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);

    } catch (error) {
        console.error('❌ Error during test:');
        console.error('Message:', error.message);
        if (error.code) console.error('Code:', error.code);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received. Request was made.');
        } else {
            console.error('Error setting up request:', error.message);
        }
        console.error('Full Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testUpload();
