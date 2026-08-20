
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

  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

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

  const resetCode = generateVerificationCode();
  const resetCodeExpiry = new Date(Date.now() + 2 * 60 * 1000); // 10 minutes

  user.resetPasswordCode = resetCode;
  user.resetPasswordExpiry = resetCodeExpiry;
  user.isVerified = false ;
  await user.save();

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

  if (!user.resetPasswordCode || !user.resetPasswordExpiry) {
    throw new Error('No reset request found. Please request a new code.');
  }

  if (Date.now() > new Date(user.resetPasswordExpiry).getTime()) {
    throw new Error('Reset code has expired. Please request a new one.');
  }

  if (resetCode !== user.resetPasswordCode) {
    throw new Error('Invalid reset code');
  }

  user.isVerified = true ;
  await user.save();

  return { message: 'Reset code verified successfully!' };
};

// ==================== RESET PASSWORD ====================
const resetPassword = async (email, newPassword) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.resetPasswordCode || !user.resetPasswordExpiry) {
    throw new Error('No reset request found. Please request a new code.');
  }

   if (!user.isVerified) {
    throw new Error('Please verify your reset code first.');
  }

  user.password = newPassword;
  user.resetPasswordCode = null;
  user.resetPasswordExpiry = null;
  user.isVerified = false ;

  await user.save();

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