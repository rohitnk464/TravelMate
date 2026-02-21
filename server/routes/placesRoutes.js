const express = require('express');
const router = express.Router();
const Place = require('../models/Place');

const upload = require('../middleware/upload');
const Guide = require('../models/Guide');

// Temporarily run image fix script on the server
router.get('/fix-images', async (req, res) => {
    try {
        const PLACEHOLDER_PLACE_IMAGE = 'https://images.unsplash.com/photo-1506744626753-eda8151a74a0?q=80&w=1920&auto=format&fit=crop';
        const PLACEHOLDER_GUIDE_IMAGE = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop';

        const places = await Place.find();
        let placesUpdated = 0;
        for (let place of places) {
            if (place.image && (place.image.includes('localhost') || place.image.includes('onrender') || place.image.includes('/uploads/'))) {
                place.image = PLACEHOLDER_PLACE_IMAGE;
                await place.save();
                placesUpdated++;
            }
        }

        const guides = await Guide.find();
        let guidesUpdated = 0;
        for (let guide of guides) {
            if (guide.imageUrl && (guide.imageUrl.includes('localhost') || guide.imageUrl.includes('onrender') || guide.imageUrl.includes('/uploads/'))) {
                guide.imageUrl = PLACEHOLDER_GUIDE_IMAGE;
                await guide.save();
                guidesUpdated++;
            }
        }

        res.json({ message: `Success. Fixed ${placesUpdated} places and ${guidesUpdated} guides.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all places
router.get('/', async (req, res) => {
    try {
        const places = await Place.find().sort({ createdAt: -1 });
        res.json(places);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new place
router.post('/', upload.single('image'), async (req, res) => {
    console.log("POST /places request received");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { name, location, description, rating, tags, safetyScore } = req.body;

    // Validate required fields
    if (!name || !location) {
        console.error("Missing required fields");
        return res.status(400).json({ message: "Name and Location are required" });
    }

    const placeData = {
        name: name.trim(),
        location: location.trim(),
        description: description ? description.trim() : "",
        rating: rating && rating !== "" ? Number(rating) : 0,
        tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(t => t !== "") : tags) : [],
        safetyScore: safetyScore && safetyScore !== "" ? Number(safetyScore) : 0,
        // Use uploaded file path or provided URL
        image: req.file ? req.file.path : (req.body.image || "")
    };

    console.log("Creating place with data:", placeData);
    const place = new Place(placeData);

    try {
        const newPlace = await place.save();
        console.log("Place saved successfully:", newPlace);
        res.status(201).json(newPlace);
    } catch (err) {
        console.error("Error saving place:", err);
        res.status(400).json({ message: err.message });
    }
});

// Delete a place
router.delete('/:id', async (req, res) => {
    try {
        await Place.findByIdAndDelete(req.params.id);
        res.json({ message: 'Place deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
