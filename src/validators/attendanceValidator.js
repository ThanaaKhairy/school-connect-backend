const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Helper to check if a date string is today (matches current day in UTC or local time)
 */
const isToday = (dateVal) => {
  if (!dateVal) return true;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return false;

  const now = new Date();

  const toDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toUTCDateStr = (date) => date.toISOString().split('T')[0];

  const inputLocal = toDateStr(d);
  const inputUTC = toUTCDateStr(d);
  const todayLocal = toDateStr(now);
  const todayUTC = toUTCDateStr(now);

  return inputLocal === todayLocal || inputUTC === todayUTC;
};

// 1. Mark single attendance schema (Strictly Today only)
const markAttendanceSchema = z.object({
  student: z.string({
    required_error: 'Student ID is required',
  }).regex(objectIdRegex, 'Invalid student ID format'),
  date: z.string().optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: 'Invalid date format' }
  ).refine(
    (val) => isToday(val),
    { message: 'Attendance can only be marked for today' }
  ),
  status: z.enum(['present', 'absent', 'late'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be present, absent, or late',
  }),
});

// 2. Bulk mark attendance schema (Strictly Today only)
const bulkMarkAttendanceSchema = z.object({
  class: z.string({
    required_error: 'Class ID is required',
  }).regex(objectIdRegex, 'Invalid class ID format'),
  date: z.string().optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: 'Invalid date format' }
  ).refine(
    (val) => isToday(val),
    { message: 'Attendance can only be marked for today' }
  ),
  records: z.array(
    z.object({
      student: z.string({
        required_error: 'Student ID is required',
      }).regex(objectIdRegex, 'Invalid student ID format'),
      status: z.enum(['present', 'absent', 'late'], {
        required_error: 'Status is required',
        invalid_type_error: 'Status must be present, absent, or late',
      }),
    }),
    {
      required_error: 'Attendance records array is required',
    }
  ).min(1, 'At least one student record is required in bulk attendance'),
});

// 3. Update attendance schema
const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'late'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be present, absent, or late',
  }),
});

// 4. Param validation schemas
const idParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid attendance record ID format'),
});

const studentParamSchema = z.object({
  studentId: z.string().regex(objectIdRegex, 'Invalid student ID format'),
});

const classParamSchema = z.object({
  classId: z.string().regex(objectIdRegex, 'Invalid class ID format'),
});

// 5. Query schemas
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

const statsQuerySchema = z.object({
  class: z.string().regex(objectIdRegex, 'Invalid class ID format').optional(),
  student: z.string().regex(objectIdRegex, 'Invalid student ID format').optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid startDate format',
  }).optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid endDate format',
  }).optional(),
});

module.exports = {
  markAttendanceSchema,
  bulkMarkAttendanceSchema,
  updateAttendanceSchema,
  idParamSchema,
  studentParamSchema,
  classParamSchema,
  getAttendanceQuerySchema,
  statsQuerySchema,
};


