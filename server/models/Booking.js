const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    guideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guide',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true // e.g., "10:00"
    },
    duration: {
        type: String,
        enum: ['1 Hour', '2 Hours', 'Half Day (4 Hours)', 'Full Day (8 Hours)'],
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
        default: 'PENDING'
    },
    paymentId: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date }
    },
    city: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create compound index to prevent double booking and for analytics
BookingSchema.index({ guideId: 1, date: 1, time: 1 }, { unique: false });
BookingSchema.index({ city: 1 });
BookingSchema.index({ guideId: 1, status: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
