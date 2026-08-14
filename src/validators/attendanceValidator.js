const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const markAttendanceSchema = z.object({
  student: z.string({
    required_error: 'Student ID is required',
  }).regex(objectIdRegex, 'Invalid student ID format'),
  date: z.string({
    required_error: 'Date is required',
  }).refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Must be a valid date string (e.g. YYYY-MM-DD)',
  }),
  status: z.enum(['present', 'absent', 'late'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be present, absent, or late',
  }),
});

const getAttendanceQuerySchema = z.object({
  student: z.string().regex(objectIdRegex, 'Invalid student ID format').optional(),
  class: z.string().regex(objectIdRegex, 'Invalid class ID format').optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid startDate format',
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid endDate format',
  }).optional(),
  status: z.enum(['present', 'absent', 'late']).optional(),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('10'),
});

const summaryQuerySchema = z.object({
  student: z.string().regex(objectIdRegex, 'Invalid student ID format').optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
  year: z.string().transform(Number).optional(),
  month: z.string().transform(Number).optional(),
  week: z.string().transform(Number).optional(),
});

module.exports = {
  markAttendanceSchema,
  getAttendanceQuerySchema,
  summaryQuerySchema,
};
