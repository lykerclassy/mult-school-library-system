// backend/routes/userRoutes.js

import express from 'express';
const router = express.Router();
import {
  createStaff,
  getStaff,
  updateUserProfile, // <-- IMPORT
  deleteStaff,       // <-- IMPORT
} from '../controllers/userController.js';
import { protect, isSchoolAdmin } from '../middleware/authMiddleware.js';

// --- Route for ANY logged-in user to update their own profile ---
router.route('/profile').put(protect, updateUserProfile);

// --- Routes for School Admins to manage staff ---
router.use(protect, isSchoolAdmin);

router.route('/staff')
  .post(createStaff)
  .get(getStaff);

router.route('/staff/:id')
  .delete(deleteStaff); // <-- ADDED

export default router;