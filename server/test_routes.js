const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const routes = [
    { method: 'get', url: '/places' },
    { method: 'get', url: '/guides' },
    { method: 'get', url: '/admin/stats' },
    { method: 'get', url: '/admin/incidents' },
    { method: 'post', url: '/ai/chat', data: { prompt: 'hello' } },
    { method: 'get', url: '/uploads/1771307465082-247691643.png', isStatic: true } // Check specific file
];

async function testRoutes() {
    console.log('Testing API Routes...');
    for (const route of routes) {
        try {
            const url = route.isStatic ? `http://localhost:5000${route.url}` : `${BASE_URL}${route.url}`;
            const res = await axios({
                method: route.method,
                url: url,
                data: route.data
            });
            console.log(`[SUCCESS] ${route.method.toUpperCase()} ${url} - Status: ${res.status}`);
        } catch (error) {
            const url = route.isStatic ? `http://localhost:5000${route.url}` : `${BASE_URL}${route.url}`;
            if (error.response) {
                console.log(`[FAILED] ${route.method.toUpperCase()} ${url} - Status: ${error.response.status} - ${error.response.statusText}`);
            } else {
                console.log(`[ERROR] ${route.method.toUpperCase()} ${route.url} - ${error.message}`);
            }
        }
    }
}

testRoutes();
