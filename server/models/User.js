const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['USER', 'GUIDE', 'ADMIN'],
        default: 'USER',
    },
    languages: {
        type: [String],
        default: [],
    },
    profileImage: {
        type: String,
        default: '',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    currentState: {
        // For safety features
        type: Object,
        default: {},
    },
    trustedContacts: [
        {
            name: { type: String, required: true },
            phone: { type: String, required: true }
        }
    ],
    lastKnownLocation: {
        lat: Number,
        lng: Number,
        address: String,
        updatedAt: { type: Date, default: Date.now }
    },
    isLocationSharing: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
