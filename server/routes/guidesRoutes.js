const express = require('express');
const router = express.Router();
const guidesController = require('../controllers/guidesController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', guidesController.getGuides);

// Protected routes (Guide only)
router.get('/earnings', protect, authorizeRoles('GUIDE'), guidesController.getEarnings);
router.get('/me', protect, authorizeRoles('GUIDE'), guidesController.getMyProfile);
router.post('/', protect, authorizeRoles('GUIDE'), upload.single('image'), guidesController.createOrUpdateProfile);

module.exports = router;
