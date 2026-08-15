const announcementService = require('../services/announcementService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  getAnnouncementsQuerySchema,
} = require('../validators/announcementValidator');

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = result.error?.issues?.[0]?.message || 'Validation failed';
    throw new Error(error);
  }
  return result.data;
};

const createAnnouncement = async (req, res) => {
  try {
    const validatedData = validate(createAnnouncementSchema, req.body);
    const result = await announcementService.createAnnouncement(validatedData, req.user);
    sendSuccess(res, result, 'Announcement created successfully and parents notified', 201);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const getAllAnnouncements = async (req, res) => {
  try {
    const validatedQuery = validate(getAnnouncementsQuerySchema, req.query);
    const result = await announcementService.getAllAnnouncements(validatedQuery);
    sendSuccess(res, result, 'Announcements retrieved successfully', 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await announcementService.getAnnouncementById(id);
    sendSuccess(res, result, 'Announcement retrieved successfully', 200);
  } catch (error) {
    if (error.message === 'Announcement not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = validate(updateAnnouncementSchema, req.body);
    const result = await announcementService.updateAnnouncement(id, validatedData, req.user);
    sendSuccess(res, result, 'Announcement updated successfully', 200);
  } catch (error) {
    if (error.message === 'Announcement not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await announcementService.deleteAnnouncement(id, req.user);
    sendSuccess(res, result, 'Announcement deleted successfully', 200);
  } catch (error) {
    if (error.message === 'Announcement not found') {
      return sendError(res, error.message, 404);
    }
    if (error.message.includes('not authorized')) {
      return sendError(res, error.message, 403);
    }
    sendError(res, error.message, 400);
  }
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
