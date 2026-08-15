const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All attendance routes require authentication
router.use(protect);

// 1. Mark single attendance (Strictly Today only) - Teachers & Admin
router.post('/', authorize('teacher', 'admin'), attendanceController.markAttendance);

// 2. Bulk mark attendance (Strictly Today only) - Teachers & Admin
router.post('/bulk', authorize('teacher', 'admin'), attendanceController.bulkMarkAttendance);

// 3. Today's attendance for a class - Teachers & Admin
router.get('/today/:classId', authorize('teacher', 'admin'), attendanceController.getTodayAttendance);

// 4. Statistics (Supports flexible date ranges, class & student filters) - Teachers, Parents, Admin
router.get('/stats', authorize('teacher', 'parent', 'admin'), attendanceController.getAttendanceStats);

// 5. Specific Student attendance - Teachers, Parents, Admin
router.get('/student/:studentId', authorize('teacher', 'parent', 'admin'), attendanceController.getStudentAttendance);

// 6. Specific Class attendance - Teachers & Admin
router.get('/class/:classId', authorize('teacher', 'admin'), attendanceController.getClassAttendance);

// 7. Update attendance record by ID - Teachers & Admin
router.put('/:id', authorize('teacher', 'admin'), attendanceController.updateAttendance);

// 8. Delete attendance record by ID - Teachers & Admin
router.delete('/:id', authorize('teacher', 'admin'), attendanceController.deleteAttendance);

// 9. Attendance history / general query with filters - Teachers, Parents, Admin
router.get('/', authorize('teacher', 'parent', 'admin'), attendanceController.getAttendanceHistory);

module.exports = router;
