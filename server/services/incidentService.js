const Incident = require('../models/Incident');

// Mock initial data (still used for stats placeholder)
const stats = {
    activeUsers: 124,
    safetyModeUsers: 45,
    activeIncidents: 0
};

const getStats = async () => {
    const incidentCount = await Incident.countDocuments({ status: { $ne: 'resolved' } });
    return {
        ...stats,
        activeIncidents: incidentCount
    };
};

const getIncidents = async () => {
    return await Incident.find().sort({ timestamp: -1 });
};

const getIncidentById = async (id) => {
    return await Incident.findById(id);
};

const createIncident = async (data) => {
    const newIncident = new Incident({
        ...data,
        logs: [{ text: 'SOS Triggered', time: new Date(), source: 'System' }]
    });
    return await newIncident.save();
};

const updateIncident = async (id, update) => {
    const incident = await Incident.findById(id);
    if (!incident) return null;

    if (update.status) incident.status = update.status;
    if (update.audioUrl) incident.audioUrl = update.audioUrl;
    if (update.log) incident.logs.unshift(update.log);

    return await incident.save();
};

module.exports = {
    getStats,
    getIncidents,
    getIncidentById,
    createIncident,
    updateIncident
};
