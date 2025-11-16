// backend/controllers/announcementController.js

import asyncHandler from 'express-async-handler';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js'; // <-- 1. IMPORT
import User from '../models/User.js'; // <-- 2. IMPORT

/**
 * @desc    Create a new announcement
 * @route   POST /api/v1/announcements
 * @access  Private (SchoolStaff)
 */
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const schoolId = req.user.school;
  const posterId = req.user._id;

  if (!title || !content) {
    res.status(400);
    throw new Error('Please provide a title and content');
  }

  // 3. Create the announcement
  const announcement = await Announcement.create({
    title,
    content,
    school: schoolId,
    postedBy: posterId,
  });

  // --- 4. CREATE NOTIFICATIONS FOR EVERYONE ELSE ---
  if (announcement) {
    // Find all users in the same school, except the person who posted
    const usersToNotify = await User.find({
      school: schoolId,
      _id: { $ne: posterId }, // $ne means 'not equal'
    }).select('_id');

    // Create a list of notification documents
    const notifications = usersToNotify.map(user => ({
      user: user._id,
      school: schoolId,
      message: `New Announcement: "${title}"`,
      link: '/announcements',
    }));

    // Insert them all into the database
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }
  // --- END NOTIFICATION LOGIC ---

  res.status(201).json(announcement);
});

/**
 * @desc    Get all announcements for the school (paginated)
 * @route   GET /api/v1/announcements
 * @access  Private (All school members)
 */
const getAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const query = { school: req.user.school };
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 }, // Show newest first
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

  // Only the user who posted it or an Admin can delete
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