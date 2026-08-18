const { z } = require('zod');

const createStudentSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .trim(),
  studentCode: z.string()
    .min(3, 'Student code must be at least 3 characters')
    .max(20, 'Student code must be at most 20 characters')
    .trim(),
  parent: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent ID format'),
  class: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID format')
});

const updateStudentSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .trim()
    .optional(),
  parent: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent ID format')
    .optional(),
  class: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID format')
    .optional()
});

module.exports = {
  createStudentSchema,
  updateStudentSchema
};