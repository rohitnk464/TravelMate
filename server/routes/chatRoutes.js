const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMessages, sendMessage } = require('../controllers/chatController');

router.use(protect);

router.get('/:bookingId', getMessages);
router.post('/:bookingId', sendMessage);

module.exports = router;
