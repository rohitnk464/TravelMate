const express = require('express');
const router = express.Router();
const nominatimService = require('../services/nominatimService');
const overpassService = require('../services/overpassService');
const osrmService = require('../services/osrmService');

/**
 * GET /api/openmap/geocode
 * Geocode a city name to coordinates
 * Query params: city (string)
 */
router.get('/geocode', async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({ error: 'City parameter is required' });
        }

        const result = await nominatimService.geocode(city);
        res.json(result);

    } catch (error) {
        console.error('Geocode API Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/planner', async (req, res) => {
    try {
        const { query, location, safetyMode, coordinates } = req.body;

        if (!query || !location) {
            return res.status(400).json({ error: 'Missing query or location' });
        }

        // Assuming aiPlannerService is imported and available
        // const plan = await aiPlannerService.generateItinerary(query, location, safetyMode, coordinates);
        // res.json(plan);

        // Placeholder for now, as aiPlannerService is not defined in the provided context
        res.status(501).json({ error: 'AI Planner Service not implemented yet', query, location, safetyMode, coordinates });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/openmap/places
 * Search for places near coordinates
 * Body: { lat, lon, type, radius }
 */
router.post('/places', async (req, res) => {
    try {
        const { lat, lon, type, radius } = req.body;

        if (!lat || !lon || !type) {
            return res.status(400).json({
                error: 'lat, lon, and type are required'
            });
        }

        const places = await overpassService.searchPlaces(
            lat,
            lon,
            type,
            radius || 5000
        );

        res.json({ places, count: places.length });

    } catch (error) {
        console.error('Places Search API Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/openmap/route
 * Calculate route between multiple points
 * Body: { coordinates: [[lon, lat], [lon, lat], ...] }
 */
router.post('/route', async (req, res) => {
    try {
        const { coordinates } = req.body;

        if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
            return res.status(400).json({
                error: 'coordinates array with at least 2 points is required'
            });
        }

        const route = await osrmService.getRoute(coordinates);
        res.json(route);

    } catch (error) {
        console.error('Route API Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/openmap/reverse
 * Reverse geocode coordinates to address
 * Query params: lat, lon
 */
router.get('/reverse', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ error: 'lat and lon parameters are required' });
        }

        const result = await nominatimService.reverseGeocode(
            parseFloat(lat),
            parseFloat(lon)
        );

        res.json(result);

    } catch (error) {
        console.error('Reverse Geocode API Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


/**
 * POST /api/openmap/trip
 * Optimize trip (TSP) - reorder points for shortest path
 * Body: { coordinates: [[lon, lat], ...] }
 */
router.post('/trip', async (req, res) => {
    try {
        const { coordinates, source, destination } = req.body;

        if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
            return res.status(400).json({
                error: 'coordinates array with at least 2 points is required'
            });
        }

        const trip = await osrmService.getOptimizedTrip(
            coordinates,
            source || 'first',
            destination || 'last'
        );
        res.json(trip);

    } catch (error) {
        console.error('Trip Optimization API Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

