const express = require('express');
const router = express.Router();
const incidentService = require('../services/incidentService');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { getUsers, getGuides, approveGuide, verifyGuide, deleteUser, getActiveSharers, getAnalytics, getAllBookings } = require('../controllers/adminController');

// Protect all admin routes
router.use(protect);
router.use(authorizeRoles('ADMIN'));

// User Management Routes
router.get('/users', getUsers);
router.get('/guides', getGuides);
router.get('/bookings', getAllBookings);
router.get('/active-sharers', getActiveSharers);
router.put('/guides/:id/approve', approveGuide);
router.put('/guides/:id/verify', verifyGuide);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);

// Incident Management Routes
// Get Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const stats = await incidentService.getStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Active Incidents
router.get('/incidents', async (req, res) => {
    try {
        const incidents = await incidentService.getIncidents();
        res.json(incidents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Single Incident
router.get('/incidents/:id', async (req, res) => {
    try {
        const incident = await incidentService.getIncidentById(req.params.id);
        if (!incident) return res.status(404).json({ message: 'Incident not found' });
        res.json(incident);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin Action (Acknowledge/Resolve)
router.patch('/incidents/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedIncident = await incidentService.updateIncident(id, req.body);

        if (!updatedIncident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        res.json(updatedIncident);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
