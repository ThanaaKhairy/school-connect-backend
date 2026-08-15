const { z } = require('zod');

const createAnnouncementSchema = z.object({
  title: z.string({
    required_error: 'Title is required',
  })
  .min(2, 'Title must be at least 2 characters')
  .max(100, 'Title must be at most 100 characters')
  .trim(),
  content: z.string({
    required_error: 'Content is required',
  })
  .min(5, 'Content must be at least 5 characters')
  .trim(),
});

const updateAnnouncementSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be at most 100 characters')
    .trim()
    .optional(),
  content: z.string()
    .min(5, 'Content must be at least 5 characters')
    .trim()
    .optional(),
});

const getAnnouncementsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('10'),
});

module.exports = {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  getAnnouncementsQuerySchema,
};
