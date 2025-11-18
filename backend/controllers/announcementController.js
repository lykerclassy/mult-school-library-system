// backend/controllers/announcementController.js

import asyncHandler from 'express-async-handler';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * @desc    Create a new announcement
 * @route   POST /api/v1/announcements
 * @access  Private (SchoolStaff)
 */
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Please provide a title and content');
  }

  // This is correct: it's tied to the user's school
  const announcement = await Announcement.create({
    title,
    content,
    school: req.user.school,
    postedBy: req.user._id,
  });

  // (Notification logic is unchanged)
  if (announcement) {
    const usersToNotify = await User.find({
      school: req.user.school,
      _id: { $ne: req.user._id },
    }).select('_id');
    const notifications = usersToNotify.map(user => ({
      user: user._id,
      school: req.user.school,
      message: `New Announcement: "${title}"`,
      link: '/announcements',
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }

  res.status(201).json(announcement);
});

/**
 * @desc    Get all announcements for the school (paginated)
 * @route   GET /api/v1/announcements
 * @access  Private (All school members)
 */
const getAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // --- THIS IS THE FIX ---
  // We must ensure the user has a school.
  // A Developer (who has no school) should not use this route.
  if (!req.user.school) {
    res.status(400);
    throw new Error('User is not associated with a school.');
  }

  // This query is now guaranteed to be specific to the user's school.
  const query = { school: req.user.school };
  // --- END OF FIX ---
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: { path: 'postedBy', select: 'name role' },
  };

  const announcements = await Announcement.paginate(query, options);
  res.status(200).json(announcements);
});

/**
 * @desc    Delete an announcement
 * @route   DELETE /api/v1/announcements/:id
 * @access  Private (SchoolAdmin)
 */
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (
    !announcement ||
    announcement.school.toString() !== req.user.school.toString()
  ) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  if (
    announcement.postedBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'SchoolAdmin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this announcement');
  }

  await announcement.deleteOne();
  res.status(200).json({ message: 'Announcement deleted' });
});

export { createAnnouncement, getAnnouncements, deleteAnnouncement };