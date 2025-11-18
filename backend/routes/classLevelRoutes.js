// backend/routes/classLevelRoutes.js

import express from 'express';
const router = express.Router();
import {
  createClassLevel,
  getClassLevels,
  getClassLevelById, // <-- 1. IMPORT
} from '../controllers/classLevelController.js';
import { protect, isSchoolAdmin, isSchoolStaff } from '../middleware/authMiddleware.js';

// This route is open to all logged-in users
router.route('/').get(protect, getClassLevels);

// --- NEW ROUTE (for staff) ---
router.route('/:id').get(protect, isSchoolStaff, getClassLevelById);

// This route is for Admins only
router.route('/').post(protect, isSchoolAdmin, createClassLevel);

export default router;