const express = require('express');
const router = express.Router();
const guidesController = require('../controllers/guidesController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', guidesController.getGuides);
router.delete('/:id', guidesController.deleteGuide);
router.patch('/:id/verify', guidesController.verifyGuide);

// Protected routes (Guide only)
router.get('/earnings', protect, authorizeRoles('GUIDE'), guidesController.getEarnings);
router.get('/me', protect, authorizeRoles('GUIDE'), guidesController.getMyProfile);
router.post('/', protect, authorizeRoles('GUIDE'), upload.single('image'), guidesController.createOrUpdateProfile);
// Admin creation without token for GuidesManager
router.post('/admin', upload.single('image'), guidesController.adminCreateGuide);

module.exports = router;
