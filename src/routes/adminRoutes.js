const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// ==================== USER ROUTES ====================
router.post('/users', adminController.registerUser);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser); // soft delete
router.patch('/users/:id/activate', adminController.activateUser);
router.delete('/users/:id/permanent', adminController.hardDeleteUser);

// ==================== STUDENT ROUTES ====================
router.post('/students', adminController.createStudent);
router.get('/students', adminController.getAllStudents);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// ==================== CLASS ROUTES ====================
router.post('/classes', adminController.createClass);
router.get('/classes', adminController.getAllClasses);
router.get('/classes/:id', adminController.getClassById);
router.put('/classes/:id', adminController.updateClass);
router.delete('/classes/:id', adminController.deleteClass);



module.exports = router;