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
  getAllUsers,
  resetUserPassword,
  changeUserRole, // <-- 1. IMPORT
} from '../controllers/userController.js';
import { protect, isSchoolAdmin, isDeveloper } from '../middleware/authMiddleware.js';
import { checkTeacherLimit } from '../middleware/limitMiddleware.js'; // <-- 2. IMPORT

// Route for ANY logged-in user to update their own profile
router.route('/profile').put(protect, updateUserProfile);

// --- Developer Only Routes ---
router.route('/all').get(protect, isDeveloper, getAllUsers);
router.route('/:id/reset-password').put(protect, isDeveloper, resetUserPassword);
router.route('/:id/change-role').put(protect, isDeveloper, changeUserRole); // <-- 3. ADD ROUTE

// --- School Admin Only Routes ---
router.use(protect, isSchoolAdmin);

router.route('/staff')
  .post(checkTeacherLimit, createStaff) // <-- 4. ADD MIDDLEWARE
  .get(getStaff);

router.route('/staff/:id')
  .delete(deleteStaff);

router.route('/parent').post(createParent);
router.route('/parents').get(getParents);

export default router;