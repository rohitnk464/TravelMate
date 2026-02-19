const mongoose = require('mongoose');

const GuideSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Linked user account
    name: { type: String, required: true },
    location: { type: String, required: true },
    languages: [{ type: String }],
    bio: { type: String },
    rating: { type: Number, default: 0 },
    hourlyRate: { type: Number, required: true },
    imageUrl: { type: String },
    verified: { type: Boolean, default: false },
    contact: { type: String },
    reviews: { type: Number, default: 0 },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    completedBookings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Guide', GuideSchema);
