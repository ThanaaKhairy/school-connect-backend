const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  validateCreateGrade,
  validateStudentIdParam,
} = require('../validators/gradeValidator');
const {
  createGrade,
  getAllGrades,
  getStudentGrades,
  getClassGrades,
  getSubjectGrades,
  updateGrade,
  deleteGrade,
  getSubjectAverages,
  getProgressTracking,
} = require('../controllers/gradeController');

// Require authentication for all grade routes
router.use(protect);

// Base Routes: /api/grades
router.route('/')
  .post(authorize('teacher', 'admin'), validateCreateGrade, createGrade)
  .get(authorize('admin', 'teacher', 'parent'), getAllGrades);

// Student Specific Routes
router.get(
  '/student/:studentId',
  authorize('admin', 'teacher', 'parent'),
  validateStudentIdParam,
  getStudentGrades
);
router.get(
  '/student/:studentId/averages',
  authorize('admin', 'teacher', 'parent'),
  validateStudentIdParam,
  getSubjectAverages
);
router.get(
  '/student/:studentId/progress',
  authorize('admin', 'teacher', 'parent'),
  validateStudentIdParam,
  getProgressTracking
);

// Class & Subject Routes
router.get(
  '/class/:classId',
  authorize('admin', 'teacher'),
  getClassGrades
);
router.get(
  '/subject/:subject',
  authorize('admin', 'teacher'),
  getSubjectGrades
);

// ID Specific Routes (Update / Delete)
router.route('/:id')
  .put(authorize('admin', 'teacher'), updateGrade)
  .delete(authorize('admin', 'teacher'), deleteGrade);

module.exports = router;