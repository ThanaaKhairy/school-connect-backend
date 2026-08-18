const { z } = require('zod');
const { sendError } = require('../utils/responseHandler');

// 1. Schema for Creating a Grade
const createGradeSchema = z.object({
  student: z
    .string({ required_error: 'Student ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid Student ID format' }),

  subject: z
    .string({ required_error: 'Subject name is required' })
    .trim()
    .min(1, { message: 'Subject cannot be empty' }),

  type: z.enum(['assignment', 'exam', 'quiz', 'project', 'participation'], {
    errorMap: () => ({
      message: 'Type must be one of: assignment, exam, quiz, project, participation',
    }),
  }),

  title: z
    .string({ required_error: 'Grade title is required' })
    .trim()
    .min(1, { message: 'Grade title cannot be empty' })
    .max(100, { message: 'Grade title cannot exceed 100 characters' }),

  score: z
    .number({ required_error: 'Score is required' })
    .min(0, { message: 'Score must be at least 0' })
    .max(100, { message: 'Score cannot exceed 100' }),

  maxScore: z
    .number({ required_error: 'Max score is required' })
    .min(1, { message: 'Max score must be at least 1' })
    .max(100, { message: 'Max score cannot exceed 100' }),

  term: z
    .enum(['first', 'second', 'final'], {
      errorMap: () => ({ message: 'Term must be first, second, or final' }),
    })
    .optional()
    .default('first'),

  comments: z
    .string()
    .trim()
    .max(500, { message: 'Comments cannot exceed 500 characters' })
    .optional(),

  date: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .or(z.date())
    .optional(),
});

// 2. Schema for Student ID URL Parameter
const studentIdParamSchema = z.object({
  studentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid Student ID format' })
    .optional(),
});

// 3. Reusable Validation Middleware Wrapper
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const firstErrorMessage = result.error.errors[0].message;
    return sendError(res, firstErrorMessage, 400);
  }

  req[source] = result.data;
  next();
};

module.exports = {
  validateCreateGrade: validate(createGradeSchema, 'body'),
  validateStudentIdParam: validate(studentIdParamSchema, 'params'),
};