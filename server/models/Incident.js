const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    user: {
        id: String,
        name: String
    },
    location: {
        lat: Number,
        lng: Number
    },
    trigger: { type: String, default: 'Manual SOS' },
    status: { type: String, enum: ['new', 'acknowledged', 'resolved'], default: 'new' },
    timestamp: { type: Date, default: Date.now },
    audioUrl: String,
    logs: [{
        text: String,
        time: { type: Date, default: Date.now },
        source: String
    }]
});

module.exports = mongoose.model('Incident', IncidentSchema);
