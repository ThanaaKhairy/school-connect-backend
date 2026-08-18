const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only parents can generate reports
router.post('/generateReport', protect, authorize('parent'), reportController.generateReport);

module.exports = router;