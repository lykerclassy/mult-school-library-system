// backend/routes/communicationRoutes.js

import express from 'express';
const router = express.Router();
import {
  createGlobalAnnouncement,
  getGlobalAnnouncements,
  deleteGlobalAnnouncement,
  createSupportTicket,
  getAllTickets,
  getMyTickets,
  getTicketById,
  replyToTicket,
} from '../controllers/communicationController.js';
import { protect, isDeveloper, isSchoolAdmin } from '../middleware/authMiddleware.js';

// --- Global Announcements ---
router.route('/global-announcements')
  .post(protect, isDeveloper, createGlobalAnnouncement)
  // --- THIS IS THE FIX ---
  // Only Developers and School Admins can GET the global list
  .get(protect, getGlobalAnnouncements); 
  // --- END OF FIX ---

router.route('/global-announcements/:id')
  .delete(protect, isDeveloper, deleteGlobalAnnouncement);

// --- Support Tickets ---
router.route('/support-tickets')
  .post(protect, isSchoolAdmin, createSupportTicket)
  .get(protect, isDeveloper, getAllTickets);
router.route('/support-tickets/my-tickets')
  .get(protect, isSchoolAdmin, getMyTickets);
router.route('/support-tickets/:id')
  .get(protect, getTicketById);
router.route('/support-tickets/:id/reply')
  .post(protect, replyToTicket);

export default router;