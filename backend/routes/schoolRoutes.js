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
// --- UPDATED IMPORT ---
import { imageUpload } from '../middleware/uploadMiddleware.js';

// --- Developer Routes ---
router
  .route('/')
  .get(protect, isDeveloper, getAllSchools);
router
  .route('/register')
  .post(protect, isDeveloper, registerSchool);

// --- School Admin Routes ---
router
  .route('/stats')
  .get(protect, isSchoolAdmin, getSchoolDashboardStats);

router
  .route('/profile')
  .get(protect, isSchoolStaff, getSchoolProfile)
  // --- UPDATED USAGE ---
  .put(protect, isSchoolAdmin, imageUpload.single('logo'), updateSchoolProfile);

export default router;