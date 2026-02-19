const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');
// const { protect } = require('../middleware/authMiddleware'); // Uncomment when auth middleware is ready

// For now, allow public access or add dummy middleware
const mockAuth = (req, res, next) => {
    req.user = { id: 'mock', role: 'traveler' };
    next();
};

router.post('/chat', mockAuth, chatWithAI);

module.exports = router;
