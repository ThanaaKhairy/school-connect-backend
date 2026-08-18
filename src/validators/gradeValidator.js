const { z } = require('zod');
const { sendError } = require('../utils/responseHandler');

// 1. Schema for Creating a Grade
const createGradeSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid Student ID format' }),

  subject: z
    .string({ required_error: 'Subject name is required' })
    .trim()
    .min(1, { message: 'Subject cannot be empty' }),

  title: z
    .string({ required_error: 'Grade title is required' })
    .trim()
    .min(1, { message: 'Grade title cannot be empty' }),

  score: z
    .number({ required_error: 'Score is required' })
    .min(0, { message: 'Score must be a positive number' }),

  maxScore: z
    .number()
    .min(1, { message: 'Max score must be greater than 0' })
    .optional()
    .default(100),

  term: z.enum(['Term 1', 'Term 2', 'Final'], {
    errorMap: () => ({ message: 'Term must be Term 1, Term 2, or Final' }),
  }),
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
    // Extract the first error message formatted by Zod
    const firstErrorMessage = result.error.errors[0].message;
    return sendError(res, firstErrorMessage, 400);
  }

  // Assign validated data back to req[source]
  req[source] = result.data;
  next();
};

module.exports = {
  validateCreateGrade: validate(createGradeSchema, 'body'),
  validateStudentIdParam: validate(studentIdParamSchema, 'params'),
};