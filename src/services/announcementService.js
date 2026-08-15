const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createAnnouncement = async (announcementData, currentUser) => {
  const announcement = await Announcement.create({
    title: announcementData.title,
    content: announcementData.content,
    createdBy: currentUser.user_id,
  });

  const populatedAnnouncement = await Announcement.findById(announcement._id)
    .populate('createdBy', 'name email role');

  try {
    const parents = await User.find({ role: 'parent', isActive: true });
    const notifications = parents.map((parent) => ({
      user: parent._id,
      title: 'New Announcement',
      message: `A new school announcement has been posted: "${announcement.title}"`,
      type: 'announcement',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (notifError) {
    console.error('Failed to create announcement notifications:', notifError.message);
  }

  return { announcement: populatedAnnouncement };
};

const getAllAnnouncements = async (queryParams) => {
  const { search, page = 1, limit = 10 } = queryParams;
  const skip = (page - 1) * limit;
  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const announcements = await Announcement.find(filter)
    .populate('createdBy', 'name email role')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Announcement.countDocuments(filter);

  return {
    announcements,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAnnouncementById = async (announcementId) => {
  const announcement = await Announcement.findById(announcementId)
    .populate('createdBy', 'name email role');

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  return { announcement };
};

const updateAnnouncement = async (announcementId, updateData, currentUser) => {
  const announcement = await Announcement.findById(announcementId);

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  if (currentUser.role !== 'admin' && announcement.createdBy.toString() !== currentUser.user_id) {
    throw new Error('You are not authorized to update this announcement');
  }

  const updatedAnnouncement = await Announcement.findByIdAndUpdate(
    announcementId,
    updateData,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email role');

  return { announcement: updatedAnnouncement };
};

const deleteAnnouncement = async (announcementId, currentUser) => {
  const announcement = await Announcement.findById(announcementId);

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  if (currentUser.role !== 'admin' && announcement.createdBy.toString() !== currentUser.user_id) {
    throw new Error('You are not authorized to delete this announcement');
  }

  await Announcement.findByIdAndDelete(announcementId);

  return { message: 'Announcement deleted successfully!' };
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
