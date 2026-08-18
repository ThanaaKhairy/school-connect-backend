const express = require('express');
const router = express.Router();
const {
  login,
  logout,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ==================== PUBLIC ROUTES ====================

// Login
router.post('/login', login);

// Forgot password flow (with OTP)
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// ==================== PROTECTED ROUTES ====================

router.use(protect);

// Logout
router.post('/logout', logout);

// Change password (while logged in - no email needed)
router.post('/change-password', changePassword);

module.exports = router;