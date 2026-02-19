const express = require('express');
const router = express.Router();
const aiPlannerService = require('../services/aiPlannerService');

// POST /api/ai-planner/planner
// Body: { query, location, safetyMode }
router.post('/planner', async (req, res) => {
    try {
        const { query, location, safetyMode, coordinates } = req.body;
        if (!query || !location) {
            return res.status(400).json({ error: 'Query and Location are required' });
        }

        const itinerary = await aiPlannerService.generateItinerary(query, location, safetyMode, coordinates);
        res.json(itinerary);
    } catch (error) {
        console.error('Planner Route Error:', error);
        res.status(500).json({ error: 'Failed to generate itinerary' });
    }
});

module.exports = router;
