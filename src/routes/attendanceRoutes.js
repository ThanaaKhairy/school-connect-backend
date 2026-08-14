const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All attendance routes require authentication
router.use(protect);

// Mark / Update daily attendance (Teachers & Admin)
router.post('/', authorize('teacher', 'admin'), attendanceController.markAttendance);

// Attendance history / absence records (Teachers, Parents, Admin)
router.get('/', authorize('teacher', 'parent', 'admin'), attendanceController.getAttendanceHistory);

// Weekly attendance summary (Teachers, Parents, Admin)
router.get('/weekly-summary', authorize('teacher', 'parent', 'admin'), attendanceController.getWeeklySummary);

// Monthly attendance summary (Teachers, Parents, Admin)
router.get('/monthly-summary', authorize('teacher', 'parent', 'admin'), attendanceController.getMonthlySummary);

module.exports = router;
