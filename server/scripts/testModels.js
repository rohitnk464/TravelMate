const mongoose = require('mongoose');
try {
    const User = require('../models/User');
    console.log('User model loaded');
    const Guide = require('../models/Guide');
    console.log('Guide model loaded');
} catch (error) {
    console.error('Error loading models:', error);
}
