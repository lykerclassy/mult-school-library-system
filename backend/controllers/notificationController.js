// backend/controllers/notificationController.js

import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

/**
 * @desc    Get notifications for the logged-in user
 * @route   GET /api/v1/notifications
 * @access  Private
 */
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20); // Get latest 20

  res.status(200).json(notifications);
});

/**
 * @desc    Mark all notifications as read
 * @route   POST /api/v1/notifications/mark-read
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } }
  );

  res.status(200).json({ message: 'All notifications marked as read' });
});

export { getMyNotifications, markAllAsRead };