const express = require('express');
const router = express.Router();
const Place = require('../models/Place');

const upload = require('../middleware/upload');

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
        image: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : (req.body.image || "")
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
