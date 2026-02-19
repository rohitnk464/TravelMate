const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for fast retrieval of chat history for a booking
MessageSchema.index({ bookingId: 1, timestamp: 1 });

module.exports = mongoose.model('Message', MessageSchema);
