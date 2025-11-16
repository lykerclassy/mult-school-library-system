// backend/routes/schoolRoutes.js

import express from 'express';
const router = express.Router();
import {
  registerSchool,
  getAllSchools,
  getSchoolDashboardStats,
  getSchoolProfile,
  updateSchoolProfile,
  assignPlanToSchool,
  toggleSchoolStatus, // <-- IMPORT
} from '../controllers/schoolController.js';
import {
  protect,
  isDeveloper,
  isSchoolAdmin,
  isSchoolStaff,
} from '../middleware/authMiddleware.js';
import { imageUpload } from '../middleware/uploadMiddleware.js';

// --- Developer Routes ---
router
  .route('/')
  .get(protect, isDeveloper, getAllSchools);
router
  .route('/register')
  .post(protect, isDeveloper, registerSchool);
  
router
  .route('/:id/assign-plan')
  .put(protect, isDeveloper, assignPlanToSchool);
  
// --- NEW DEVELOPER ROUTE ---
router
  .route('/:id/toggle-status')
  .put(protect, isDeveloper, toggleSchoolStatus);

// --- School Admin Routes ---
router
  .route('/stats')
  .get(protect, isSchoolAdmin, getSchoolDashboardStats);

router
  .route('/profile')
  .get(protect, isSchoolStaff, getSchoolProfile)
  .put(protect, isSchoolAdmin, imageUpload.single('logo'), updateSchoolProfile);

export default router;