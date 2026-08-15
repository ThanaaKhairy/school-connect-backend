const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post(
  '/',
  authorize('teacher', 'admin'),
  assignmentController.createAssignment
);

router.get(
  '/',
  authorize('teacher', 'parent', 'admin'),
  assignmentController.getAllAssignments
);

router.get(
  '/stats',
  authorize('teacher', 'admin'),
  assignmentController.getAssignmentStats
);

router.get(
  '/class/:classId',
  authorize('teacher', 'parent', 'admin'),
  assignmentController.getAssignmentsByClass
);

router.get(
  '/student/:studentId',
  authorize('teacher', 'parent', 'admin'),
  assignmentController.getAssignmentsByStudent
);

router.get(
  '/:id',
  authorize('teacher', 'parent', 'admin'),
  assignmentController.getAssignmentById
);

router.put(
  '/:id',
  authorize('teacher', 'admin'),
  assignmentController.updateAssignment
);

router.delete(
  '/:id',
  authorize('teacher', 'admin'),
  assignmentController.deleteAssignment
);

module.exports = router;
