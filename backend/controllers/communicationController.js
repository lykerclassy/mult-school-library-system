// backend/controllers/communicationController.js

import asyncHandler from 'express-async-handler';
import GlobalAnnouncement from '../models/GlobalAnnouncement.js';
import SupportTicket from '../models/SupportTicket.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import School from '../models/School.js'; // <-- IMPORT SCHOOL

// --- (Global Announcement functions are unchanged) ---
const createGlobalAnnouncement = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const announcement = await GlobalAnnouncement.create({
    title,
    content,
    postedBy: req.user._id,
  });
  if (announcement) {
    const adminsToNotify = await User.find({ role: 'SchoolAdmin' }).select('_id school');
    const notifications = adminsToNotify.map(admin => ({
      user: admin._id,
      school: admin.school,
      message: `New Global Announcement from the Developer: "${title}"`,
      link: '/announcements',
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }
  res.status(201).json(announcement);
});
const getGlobalAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await GlobalAnnouncement.find({})
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 });
  res.status(200).json(announcements);
});
const deleteGlobalAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await GlobalAnnouncement.findById(req.params.id);
  if (announcement) {
    await announcement.deleteOne();
    res.status(200).json({ message: 'Global announcement deleted' });
  } else {
    res.status(404);
    throw new Error('Announcement not found');
  }
});


// --- Support Tickets (UPDATED) ---

/**
 * @desc    Create a new support ticket
 * @route   POST /api/v1/comm/support-tickets
 * @access  Private (SchoolAdmin)
 */
const createSupportTicket = asyncHandler(async (req, res) => {
  const { title, category, message } = req.body;
  
  const firstMessage = {
    sender: req.user._id,
    message: message,
  };

  const ticket = await SupportTicket.create({
    school: req.user.school,
    submittedBy: req.user._id,
    title,
    category,
    messages: [firstMessage],
  });

  // --- START NOTIFICATION FIX ---
  if (ticket) {
    const developer = await User.findOne({ role: 'Developer' });
    if (developer) {
      const school = await School.findById(req.user.school).select('name');
      await Notification.create({
        user: developer._id, // Notify the Developer
        school: req.user.school, // From this school
        message: `New Ticket from ${school.name}: "${title}"`,
        link: `/support/ticket/${ticket._id}`,
      });
    }
  }
  // --- END NOTIFICATION FIX ---

  res.status(201).json(ticket);
});

/**
 * @desc    Get all tickets (for Developer)
 * @route   GET /api/v1/comm/support-tickets
 * @access  Private (Developer)
 */
const getAllTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({})
    .populate('school', 'name')
    .populate('submittedBy', 'name email')
    .sort({ status: 1, updatedAt: -1 });
  res.status(200).json(tickets);
});

/**
 * @desc    Get a school's own tickets (for SchoolAdmin)
 * @route   GET /api/v1/comm/support-tickets/my-tickets
 * @access  Private (SchoolAdmin)
 */
const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ school: req.user.school })
    .sort({ updatedAt: -1 });
  res.status(200).json(tickets);
});

/**
 * @desc    Get a single ticket by ID
 * @route   GET /api/v1/comm/support-tickets/:id
 * @access  Private (Developer or SchoolAdmin)
 */
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate('school', 'name')
    .populate('submittedBy', 'name')
    .populate('messages.sender', 'name role');
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  if (
    req.user.role !== 'Developer' &&
    ticket.school._id.toString() !== req.user.school.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to access this ticket');
  }
  res.status(200).json(ticket);
});

/**
 * @desc    Reply to a support ticket
 * @route   POST /api/v1/comm/support-tickets/:id/reply
 * @access  Private (Developer or SchoolAdmin)
 */
const replyToTicket = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    res.status(404); throw new Error('Ticket not found');
  }
  if (
    req.user.role !== 'Developer' &&
    ticket.school.toString() !== req.user.school.toString()
  ) {
    res.status(403); throw new Error('Not authorized to access this ticket');
  }
  const reply = { sender: req.user._id, message: message };
  ticket.messages.push(reply);
  ticket.status = req.user.role === 'Developer' ? 'In Progress' : 'Open';
  
  await ticket.save();

  // --- START NOTIFICATION FIX ---
  if (req.user.role === 'Developer') {
    // Notify the School Admin who submitted the ticket
    await Notification.create({
      user: ticket.submittedBy,
      school: ticket.school,
      message: `You have a new reply on ticket: "${ticket.title}"`,
      link: `/support/ticket/${ticket._id}`
    });
  } else {
    // Notify the Developer
    const developer = await User.findOne({ role: 'Developer' });
    if (developer) {
      const school = await School.findById(ticket.school).select('name');
      await Notification.create({
        user: developer._id,
        school: ticket.school,
        message: `New reply from ${school.name} on ticket: "${ticket.title}"`,
        link: `/support/ticket/${ticket._id}`
      });
    }
  }
  // --- END NOTIFICATION FIX ---

  res.status(200).json(ticket);
});

export {
  createGlobalAnnouncement,
  getGlobalAnnouncements,
  deleteGlobalAnnouncement,
  createSupportTicket,
  getAllTickets,
  getMyTickets,
  getTicketById,
  replyToTicket,
};