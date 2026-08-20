const { z } = require('zod');

const loginSchema = z.object({
  email: z.string()
    .email('Please provide a valid email')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
});

const emailSchema = z.object({
  email: z.string()
    .email('Please provide a valid email')
    .toLowerCase()
    .trim()
});

const verifyResetCodeSchema = z.object({
  email: z.string()
    .email('Please provide a valid email')
    .toLowerCase()
    .trim(),
  resetCode: z.string()
    .length(6, 'Reset code must be 6 digits')
});

const resetPasswordSchema = z.object({
  email: z.string()
    .email('Please provide a valid email')
    .toLowerCase()
    .trim(),
  newPassword: z.string()
    .min(6, 'New password must be at least 6 characters')
});

const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'New password must be at least 6 characters')
});

module.exports = {
  loginSchema,
  emailSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  changePasswordSchema
};