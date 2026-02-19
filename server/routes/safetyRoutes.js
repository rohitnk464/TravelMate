const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createIncident, getIncidentStatus, uploadAudio } = require('../controllers/safetyController');
const safetyUpload = require('../middleware/safetyUpload');

// All safety routes require authentication
router.use(protect);

router.post('/incidents', createIncident);
router.get('/incidents/:id', getIncidentStatus);
router.post('/incidents/:id/audio', safetyUpload.single('audio'), uploadAudio);

module.exports = router;
