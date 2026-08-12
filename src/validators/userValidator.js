const { z } = require('zod');

// User schemas

const registerUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must be at most 30 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces')
    .trim(),
  email: z.string()
    .email('Please provide a valid email')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'teacher', 'parent']),
  phone: z.string()
    .regex(/^01[0125][0-9]{8}$/, 'Phone number must be a valid Egyptian number (e.g., 01012345678)')
    .optional()
});

const updateUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(30, 'Name must be at most 30 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces')
    .trim()
    .optional(),
  phone: z.string()
    .regex(/^01[0125][0-9]{8}$/, 'Phone number must be a valid Egyptian number (e.g., 01012345678)')
    .optional(),
  isActive: z.boolean().optional()
});

const getUsersQuerySchema = z.object({
  role: z.enum(['admin', 'teacher', 'parent']).optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('10')
});



module.exports = {
  registerUserSchema,
  updateUserSchema,
  getUsersQuerySchema
  
};