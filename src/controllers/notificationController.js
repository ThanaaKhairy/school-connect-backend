const notificationService = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getUserNotifications = async (req, res) => {
  try {
    const result = await notificationService.getUserNotifications(req.user.user_id, req.query);
    sendSuccess(res, result, 'Notifications retrieved successfully', 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notificationService.markAsRead(id, req.user.user_id);
    sendSuccess(res, result, 'Notification marked as read', 200);
  } catch (error) {
    if (error.message === 'Notification not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.user_id);
    sendSuccess(res, result, 'All notifications marked as read', 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.user_id);
    sendSuccess(res, result, 'Unread notification count retrieved successfully', 200);
  } catch (error) {
    sendError(res, error.message, 400);
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notificationService.deleteNotification(id, req.user.user_id);
    sendSuccess(res, result, 'Notification deleted successfully', 200);
  } catch (error) {
    if (error.message === 'Notification not found') {
      return sendError(res, error.message, 404);
    }
    sendError(res, error.message, 400);
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};
