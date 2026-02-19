const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// All payment routes are demo-only for now
router.post('/demo', paymentController.processDemoPayment);

module.exports = router;
