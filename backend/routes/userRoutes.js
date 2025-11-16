// backend/routes/userRoutes.js

import express from 'express';
const router = express.Router();
import {
  createStaff,
  getStaff,
  updateUserProfile,
  deleteStaff,
  createParent,
  getParents,
  getAllUsers, // <-- IMPORT
  resetUserPassword, // <-- IMPORT
} from '../controllers/userController.js';
import { protect, isSchoolAdmin, isDeveloper } from '../middleware/authMiddleware.js'; // <-- IMPORT isDeveloper

// Route for ANY logged-in user to update their own profile
router.route('/profile').put(protect, updateUserProfile);

// --- Developer Only Routes ---
router.route('/all').get(protect, isDeveloper, getAllUsers);
router.route('/:id/reset-password').put(protect, isDeveloper, resetUserPassword);

// --- School Admin Only Routes ---
router.use(protect, isSchoolAdmin);

router.route('/staff')
  .post(createStaff)
  .get(getStaff);
router.route('/staff/:id')
  .delete(deleteStaff);
router.route('/parent').post(createParent);
router.route('/parents').get(getParents);

export default router;