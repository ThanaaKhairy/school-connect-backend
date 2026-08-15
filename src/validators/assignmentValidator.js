const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createAssignmentSchema = z.object({
  title: z.string({
    required_error: 'Assignment title is required',
  })
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters')
    .trim(),

  description: z.string({
    required_error: 'Assignment description is required',
  })
    .max(2000, 'Description must be at most 2000 characters')
    .trim(),

  subject: z.string({
    required_error: 'Subject is required',
  })
    .max(100, 'Subject must be at most 100 characters')
    .trim(),

  class: z.string({
    required_error: 'Class ID is required',
  }).regex(objectIdRegex, 'Invalid class ID format'),

  dueDate: z.string({
    required_error: 'Due date is required',
  }).refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Use YYYY-MM-DD',
  }).refine((val) => new Date(val) > new Date(), {
    message: 'Due date must be in the future',
  }),

  totalMarks: z.number({
    required_error: 'Total marks is required',
    invalid_type_error: 'Total marks must be a number',
  })
    .min(1, 'Total marks must be at least 1')
    .max(1000, 'Total marks must be at most 1000'),

  status: z.enum(['active', 'closed', 'draft'], {
    invalid_type_error: 'Status must be active, closed, or draft',
  }).optional().default('active'),
});

const updateAssignmentSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters')
    .trim()
    .optional(),

  description: z.string()
    .max(2000, 'Description must be at most 2000 characters')
    .trim()
    .optional(),

  subject: z.string()
    .max(100, 'Subject must be at most 100 characters')
    .trim()
    .optional(),

  dueDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format. Use YYYY-MM-DD',
    })
    .optional(),

  totalMarks: z.number()
    .min(1, 'Total marks must be at least 1')
    .max(1000, 'Total marks must be at most 1000')
    .optional(),

  status: z.enum(['active', 'closed', 'draft']).optional(),
});

const getAssignmentsQuerySchema = z.object({
  class: z.string().regex(objectIdRegex, 'Invalid class ID format').optional(),
  teacher: z.string().regex(objectIdRegex, 'Invalid teacher ID format').optional(),
  subject: z.string().optional(),
  status: z.enum(['active', 'closed', 'draft']).optional(),
  search: z.string().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid startDate format',
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid endDate format',
  }).optional(),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('10'),
  sortBy: z.enum(['dueDate', 'createdAt', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = {
  createAssignmentSchema,
  updateAssignmentSchema,
  getAssignmentsQuerySchema,
};
