const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, default: 0 },
    image: { type: String },
    tags: [{ type: String }],
    safetyScore: { type: Number, default: 0 }, // 0-100
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Place', PlaceSchema);
