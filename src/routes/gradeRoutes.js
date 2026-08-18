const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  validateCreateGrade,
  validateStudentIdParam,
} = require('../validators/gradeValidator');
const {
  createGrade,
  getStudentGrades,
  getSubjectAverages,
  getProgressTracking,
} = require('../controllers/gradeController');


router.use(protect);

router.post('/', authorize('teacher', 'admin'), validateCreateGrade, createGrade);


router.get('/student/:studentId', authorize('admin', 'teacher', 'parent', 'student'), validateStudentIdParam, getStudentGrades);
router.get('/student/:studentId/averages', authorize('admin', 'teacher', 'parent', 'student'), validateStudentIdParam, getSubjectAverages);
router.get('/student/:studentId/progress', authorize('admin', 'teacher', 'parent', 'student'), validateStudentIdParam, getProgressTracking);

module.exports = router;