// ============================================================
// FILE 8: controllers/authController.js
// ============================================================
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const authService = require('../services/authService');
const {
  loginSchema,
  emailSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  changePasswordSchema
} = require('../validators/authValidator');

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = result.error?.issues?.[0]?.message || 'Validation failed';
    throw new Error(error);
  }
  return result.data;
};

// ==================== LOGIN ====================
const login = async (req, res) => {
  try {
    const validatedData = validate(loginSchema, req.body);
    const user = await authService.loginUser(
      validatedData.email,
      validatedData.password
    );

    const token = generateToken(user._id, user.email, user.name, user.role);

    sendSuccess(res, {
      token,
      user: {
        user_id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
      }
    }, 'Login successful!', 200);
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return sendError(res, error.message, 401);
    }
    if (error.message === 'Your account has been deactivated. Please contact admin.') {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

// ==================== LOGOUT ====================
const logout = (req, res) => {
  sendSuccess(res, null, 'Logout successful!', 200);
};



// ==================== CHANGE PASSWORD ====================
const changePassword = async (req, res) => {
  try {
    const validatedData = validate(changePasswordSchema, req.body);
    const result = await authService.changePassword(
      req.user.user_id,
      validatedData.currentPassword,
      validatedData.newPassword
    );
    sendSuccess(res, result, 'Password changed successfully', 200);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message === 'Current password is incorrect') {
      return sendError(res, error.message, 401);
    }
    sendError(res, error.message, 400);
  }
};

// ==================== FORGOT PASSWORD ====================
const forgotPassword = async (req, res) => {
  try {
    const validatedData = validate(emailSchema, req.body);
    const result = await authService.forgotPassword(validatedData.email);
    sendSuccess(res, result, 'Password reset code sent to your email', 200);
  } catch (error) {
    if (error.message === 'Email not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

// ==================== VERIFY RESET CODE ====================
const verifyResetCode = async (req, res) => {
  try {
    const validatedData = validate(verifyResetCodeSchema, req.body);
    const result = await authService.verifyResetCode(
      validatedData.email,
      validatedData.resetCode
    );
    sendSuccess(res, result, 'Reset code verified successfully', 200);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message === 'Reset code has expired. Please request a new one.') {
      return sendError(res, error.message, 400);
    }
    if (error.message === 'No reset request found. Please request a new code.') {
      return sendError(res, error.message, 400);
    }
    if (error.message === 'Invalid reset code') {
      return sendError(res, error.message, 400);
    }
    sendError(res, error.message, 400);
  }
};

// ==================== RESET PASSWORD ====================
const resetPassword = async (req, res) => {
  try {
    const validatedData = validate(resetPasswordSchema, req.body);
    const result = await authService.resetPassword(
      validatedData.email,
      validatedData.newPassword
    );
    sendSuccess(res, result, 'Password reset successfully', 200);
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message === 'No reset request found. Please request a new code.') {
      return sendError(res, error.message, 400);
    }
    if (error.message === 'Reset code has expired. Please request a new one.') {
      return sendError(res, error.message, 400);
    }
    sendError(res, error.message, 400);
  }
};

module.exports = {
  login,
  logout,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword
};