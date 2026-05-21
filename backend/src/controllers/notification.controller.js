import Notification from '../models/notification.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const createNotification = async (type, message, data = {}) => {
  try {
    await Notification.create({
      type,
      message,
      data,
      readBy: [],
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments();
  const unreadCount = await Notification.countDocuments({
    readBy: { $ne: req.user._id },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        data: notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
        unreadCount,
      },
      'Notifications retrieved successfully'
    )
  );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (!notification.readBy.includes(req.user._id)) {
    notification.readBy.push(req.user._id);
    await notification.save();
  }

  res.status(200).json(new ApiResponse(200, null, 'Notification marked as read'));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { readBy: { $ne: req.user._id } },
    { $push: { readBy: req.user._id } }
  );

  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});
