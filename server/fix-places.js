const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

try {
    const envConfig = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...rest] = line.split('=');
        if (key && rest.length > 0) {
            process.env[key.trim()] = rest.join('=').trim();
        }
    });
} catch (e) {
    console.warn('.env file not found');
}

const Place = require('./models/Place');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Find all places taking the default db name or the one specified
        const places = await Place.find();
        let updatedCount = 0;

        for (let place of places) {
            if (place.image && place.image.includes('localhost:5000')) {
                // we should replace it with the dynamic path or a relative path
                // For production, the best approach is to store relative paths
                // but the frontend component Destinations.tsx checks if image exists and appends nothing.
                // Oh wait, PlacesRoutes.js appends http://localhost:5000
                // The Next.js frontend is deployed on Vercel, the backend on Render.
                // If the upload happened, the image exists on Render (unless it was ephemeral storage).
                // Let's replace 'http://localhost:5000' with 'https://travelmate-backend.onrender.com'
                // OR just keep the '/uploads/filename.ext' but prepend the Render URL.
                const newUrl = place.image.replace('http://localhost:5000', 'https://travelmate-backend.onrender.com');
                place.image = newUrl;
                await place.save();
                updatedCount++;
                console.log(`Updated ${place.name}: ${newUrl}`);
            }
        }

        console.log(`Fixed ${updatedCount} places.`);
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Connection error', err);
        process.exit(1);
    });
