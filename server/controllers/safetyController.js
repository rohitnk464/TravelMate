const incidentService = require('../services/incidentService');

// @desc    Create a new safety incident (SOS, Alert, etc.)
// @route   POST /api/safety/incidents
// @access  Private
exports.createIncident = async (req, res) => {
    try {
        const { location, trigger } = req.body;

        const incidentData = {
            user: {
                id: req.user.id,
                name: req.user.name
            },
            location: location || { lat: 0, lng: 0 },
            trigger: trigger || 'Manual SOS',
            status: 'new'
        };

        const incident = await incidentService.createIncident(incidentData);

        // Notify admins via socket if available
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_incident', incident);
        }

        res.status(201).json(incident);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get status of a specific incident
// @route   GET /api/safety/incidents/:id
// @access  Private
exports.getIncidentStatus = async (req, res) => {
    try {
        const incident = await incidentService.getIncidentById(req.params.id);

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        // Only allow the user who created it or an admin to view
        if (incident.user.id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to view this incident' });
        }

        res.json(incident);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload audio for an incident
// @route   POST /api/safety/incidents/:id/audio
// @access  Private
exports.uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file provided' });
        }

        const incident = await incidentService.getIncidentById(req.params.id);
        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        // Only allow the user who created it
        if (incident.user.id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to upload to this incident' });
        }

        // Update incident with audio URL
        const audioUrl = `/uploads/safety/${req.file.filename}`;
        const updatedIncident = await incidentService.updateIncident(req.params.id, { audioUrl });

        // Update logs
        await incidentService.updateIncident(req.params.id, {
            log: { text: "Audio Clip Uploaded.", time: new Date(), source: "System" }
        });

        // Notify admins via socket
        const io = req.app.get('socketio');
        if (io) {
            io.emit('incident_updated', updatedIncident);
        }

        res.json(updatedIncident);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
