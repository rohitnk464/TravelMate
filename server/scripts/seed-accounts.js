const axios = require('axios');

const API = 'http://localhost:5000/api';

const accounts = [
    { name: 'Admin User', email: 'admin@travelmate.com', password: 'Admin@123', role: 'ADMIN' },
    { name: 'Guide User', email: 'guide@travelmate.com', password: 'Guide@123', role: 'GUIDE' },
    { name: 'Test Traveler', email: 'user@travelmate.com', password: 'User@123', role: 'USER' },
];

async function seed() {
    for (const acc of accounts) {
        try {
            const res = await axios.post(`${API}/auth/register`, acc);
            console.log(`CREATED: ${acc.email} (${acc.role})`);
        } catch (e) {
            const msg = e.response?.data?.message || e.message;
            if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) {
                console.log(`EXISTS:  ${acc.email} (${acc.role})`);
            } else {
                console.log(`ERROR:   ${acc.email} -> ${msg}`);
            }
        }
    }

    console.log('\n=== Login Credentials ===');
    console.log('ADMIN  -> admin@travelmate.com  /  Admin@123');
    console.log('GUIDE  -> guide@travelmate.com  /  Guide@123');
    console.log('USER   -> user@travelmate.com   /  User@123');
    console.log('\nNote: GUIDE account needs admin approval before login works.');
    console.log('      Login as ADMIN first, then approve the guide from the dashboard.');
}

seed();
