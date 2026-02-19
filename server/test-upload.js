const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    const token = 'YOUR_TEST_TOKEN'; // I need to get a token
    const url = 'http://localhost:5000/api/auth/profile';

    const form = new FormData();
    form.append('name', 'Test User');
    // Simulate a small image file
    const dummyImagePath = path.join(__dirname, 'dummy.png');
    fs.writeFileSync(dummyImagePath, 'dummy content');
    form.append('image', fs.createReadStream(dummyImagePath));

    try {
        const response = await axios.put(url, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Upload Response:', response.data);
    } catch (error) {
        console.error('Upload Error:', error.response ? error.response.data : error.message);
    } finally {
        if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
    }
}

// I need a valid token to test this, or I can check the logs
// Let's first check the logs of the running server if possible.
