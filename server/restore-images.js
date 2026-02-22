const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const Place = require('./models/Place');
const Guide = require('./models/Guide');

const PLACEHOLDER_PLACE_IMAGE = 'https://images.unsplash.com/photo-1506744626753-eda8151a74a0?q=80&w=1920&auto=format&fit=crop';
const PLACEHOLDER_GUIDE_IMAGE = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop';

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Fix Places
        const places = await Place.find();
        let placesUpdated = 0;
        for (let place of places) {
            if (place.image && (place.image.includes('localhost') || place.image.includes('onrender') || place.image.includes('/uploads/'))) {
                place.image = PLACEHOLDER_PLACE_IMAGE;
                await place.save();
                placesUpdated++;
            }
        }
        console.log(`Reset ${placesUpdated} broken place images to placeholders.`);

        // Fix Guides
        const guides = await Guide.find();
        let guidesUpdated = 0;
        for (let guide of guides) {
            if (guide.imageUrl && (guide.imageUrl.includes('localhost') || guide.imageUrl.includes('onrender') || guide.imageUrl.includes('/uploads/'))) {
                guide.imageUrl = PLACEHOLDER_GUIDE_IMAGE;
                await guide.save();
                guidesUpdated++;
            }
        }
        console.log(`Reset ${guidesUpdated} broken guide images to placeholders.`);

        console.log('Done restoring images.');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Connection error', err);
        process.exit(1);
    });
