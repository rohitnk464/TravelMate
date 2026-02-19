const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testAuth = async () => {
    try {
        console.log('--- Testing Registration ---');

        // Register User
        try {
            const userRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test User',
                email: 'user_test_' + Date.now() + '@test.com',
                password: 'password123',
                role: 'USER'
            });
            console.log('User Registered:', userRes.data.role, userRes.data.isVerified);
        } catch (e) { console.error('User Reg Error:', e.response?.data || e.message); }

        // Register Guide
        let guideEmail = 'guide_test_' + Date.now() + '@test.com';
        try {
            const guideRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Test Guide',
                email: guideEmail,
                password: 'password123',
                role: 'GUIDE'
            });
            console.log('Guide Registered:', guideRes.data.role, guideRes.data.isVerified);
        } catch (e) { console.error('Guide Reg Error:', e.response?.data || e.message); }

        console.log('\n--- Testing Login (Guide - Pending) ---');
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: guideEmail,
                password: 'password123'
            });
        } catch (e) {
            console.log('Expected Error:', e.response?.data?.message);
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
};

testAuth();
