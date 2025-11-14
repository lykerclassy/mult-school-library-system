// backend/routes/schoolRoutes.js

import express from 'express';
const router = express.Router();
import {
  registerSchool,
  getAllSchools,
  getSchoolDashboardStats,
  getSchoolProfile,
  updateSchoolProfile,
} from '../controllers/schoolController.js';
import {
  protect,
  isDeveloper,
  isSchoolAdmin,
  isSchoolStaff,
} from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// --- Developer Routes ---
// These routes are only for the Developer
router
  .route('/')
  .get(protect, isDeveloper, getAllSchools);
router
  .route('/register')
  .post(protect, isDeveloper, registerSchool);

// --- School Admin Routes ---
// These routes are for School Staff/Admins
router
  .route('/stats')
  .get(protect, isSchoolAdmin, getSchoolDashboardStats);

router
  .route('/profile')
  .get(protect, isSchoolStaff, getSchoolProfile) // Staff can view
  .put(protect, isSchoolAdmin, upload.single('logo'), updateSchoolProfile); // Only Admin can edit

export default router;