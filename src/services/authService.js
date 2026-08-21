
const User = require('../models/User');
const generateVerificationCode = require('../utils/generateCode');
const { sendPasswordResetEmail, sendPasswordChangedEmail } = require('./emailService');

// ==================== LOGIN ====================
const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Your account has been deactivated. Please contact admin.');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  return user;
};
// ==================== CHANGE PASSWORD (Logged In) ====================

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password (will be hashed by pre-save hook)
  user.password = newPassword;
  await user.save();

  // Send notification email
  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (emailError) {
    console.error('Email sending failed:', emailError.message);
  }

  return { message: 'Password changed successfully!' };
};

// ==================== FORGOT PASSWORD (Send OTP) ====================

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Email not found');
  }

  // Check if account is locked due to too many failed attempts
  if (user.resetLockUntil && new Date(user.resetLockUntil) > new Date()) {
    const remainingTime = Math.ceil((new Date(user.resetLockUntil) - new Date()) / 1000 / 60);
    throw new Error(`Account is locked. Please try again after ${remainingTime} minutes.`);
  }

  // Reset failed attempts when requesting a new code
  user.resetAttempts = 0;
  user.resetLockUntil = null;

  // Generate 6-digit verification code
  const resetCode = generateVerificationCode();
  const resetCodeExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

  // Save reset data to user document
  user.resetPasswordCode = resetCode;
  user.resetPasswordExpiry = resetCodeExpiry;
  user.isVerified = false;
  await user.save();

  // Send OTP via email
  try {
    await sendPasswordResetEmail(user.email, user.name, resetCode);
  } catch (emailError) {
    console.error('Email sending failed:', emailError.message);
  }

  return { message: 'Password reset code sent to your email.' };
};

// ==================== VERIFY RESET CODE (OTP) ====================

const verifyResetCode = async (email, resetCode) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if reset request exists
  if (!user.resetPasswordCode || !user.resetPasswordExpiry) {
    throw new Error('No reset request found. Please request a new code.');
  }

  // Check if account is locked due to too many failed attempts
  if (user.resetLockUntil && new Date(user.resetLockUntil) > new Date()) {
    const remainingTime = Math.ceil((new Date(user.resetLockUntil) - new Date()) / 1000 / 60);
    throw new Error(`Too many failed attempts. Please try again after ${remainingTime} minutes.`);
  }

  // Check if code has expired
  if (Date.now() > new Date(user.resetPasswordExpiry).getTime()) {
    throw new Error('Reset code has expired. Please request a new one.');
  }

  // Validate OTP code
  if (resetCode !== user.resetPasswordCode) {
    // Increment failed attempts counter
    user.resetAttempts = (user.resetAttempts || 0) + 1;

    // Lock account after 3 failed attempts
    if (user.resetAttempts >= 3) {
      user.resetLockUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 minutes
      await user.save();
      throw new Error('Too many failed attempts. Account locked for 10 minutes.');
    }

    await user.save();
    throw new Error(`Invalid reset code. ${3 - user.resetAttempts} attempts remaining.`);
  }

  // Code verified successfully - mark as verified and reset counters
  user.isVerified = true;
  user.resetAttempts = 0;
  user.resetLockUntil = null;
  await user.save();

  return { message: 'Reset code verified successfully!' };
};

// ==================== RESET PASSWORD ====================

const resetPassword = async (email, newPassword) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if reset request exists
  if (!user.resetPasswordCode || !user.resetPasswordExpiry) {
    throw new Error('No reset request found. Please request a new code.');
  }

  // Verify that OTP was verified
  if (!user.isVerified) {
    throw new Error('Please verify your reset code first.');
  }

  // Update password (will be hashed by pre-save hook)
  user.password = newPassword;
  
  // Clear all reset data
  user.resetPasswordCode = null;
  user.resetPasswordExpiry = null;
  user.isVerified = false;
  user.resetAttempts = 0;
  user.resetLockUntil = null;

  await user.save();

  // Send confirmation email
  try {
    await sendPasswordChangedEmail(user.email, user.name);
  } catch (emailError) {
    console.error('Email sending failed:', emailError.message);
  }

  return { message: 'Password reset successfully!' };
};

module.exports = {
  loginUser,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword
};