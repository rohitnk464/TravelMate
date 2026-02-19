const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateContacts, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/contacts', protect, updateContacts);
router.put('/profile', protect, upload.single('image'), updateProfile);

module.exports = router;
