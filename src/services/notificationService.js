const Notification = require('../models/Notification');

const getUserNotifications = async (userId, queryParams) => {
  const { type, isRead, page = 1, limit = 10 } = queryParams;
  const skip = (page - 1) * limit;

  const filter = { user: userId };

  if (type) {
    filter.type = type;
  }

  if (isRead !== undefined) {
    filter.isRead = isRead === 'true' || isRead === true;
  }

  const notifications = await Notification.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Notification.countDocuments(filter);

  return {
    notifications,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });

  if (!notification) {
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  return { notification };
};

const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );

  return { message: 'All notifications marked as read', modifiedCount: result.modifiedCount };
};

const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ user: userId, isRead: false });
  return { count };
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, user: userId });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return { message: 'Notification deleted successfully!' };
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
};
