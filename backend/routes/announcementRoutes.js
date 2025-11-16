// backend/routes/announcementRoutes.js

import express from 'express';
const router = express.Router();
import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import {
  protect,
  isSchoolAdmin,
  isSchoolStaff,
} from '../middleware/authMiddleware.js';

// --- Routes for all school members ---
router.route('/').get(protect, getAnnouncements); // Everyone can read

// --- Routes for staff only ---
router.route('/').post(protect, isSchoolStaff, createAnnouncement);

// --- Routes for Admin only (or original poster, handled in controller) ---
router.route('/:id').delete(protect, isSchoolStaff, deleteAnnouncement);

export default router;