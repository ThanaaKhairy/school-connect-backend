const { z } = require('zod');

const createClassSchema = z.object({
  name: z.string()
    .min(2, 'Class name must be at least 2 characters')
    .max(50, 'Class name must be at most 50 characters')
    .trim(),
  teachers: z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID format')
  ).min(1, 'At least one teacher is required')
});

const updateClassSchema = z.object({
  name: z.string()
    .min(2, 'Class name must be at least 2 characters')
    .max(50, 'Class name must be at most 50 characters')
    .trim()
    .optional(),
  teachers: z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID format')
  ).optional()
});

module.exports = {
  createClassSchema,
  updateClassSchema
};