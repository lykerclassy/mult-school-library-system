// backend/routes/userRoutes.js

import express from 'express';
const router = express.Router();
import {
  createStaff, getStaff, updateUserProfile, deleteStaff,
  createParent, getParents, getAllUsers, resetUserPassword,
  changeUserRole, getDemoAccounts, // <-- IMPORT
} from '../controllers/userController.js';
import { protect, isSchoolAdmin, isDeveloper } from '../middleware/authMiddleware.js';
import { checkTeacherLimit } from '../middleware/limitMiddleware.js';

// Route for ANY logged-in user
router.route('/profile').put(protect, updateUserProfile);

// --- Developer Only Routes ---
router.route('/all').get(protect, isDeveloper, getAllUsers);
router.route('/:id/reset-password').put(protect, isDeveloper, resetUserPassword);
router.route('/:id/change-role').put(protect, isDeveloper, changeUserRole);

// --- School Admin Only Routes ---
router.use(protect, isSchoolAdmin);

// --- NEW DEMO ROUTE ---
// We can use 'isSchoolAdmin' as the Demo Admin has this role
router.route('/demo-accounts').get(getDemoAccounts);

// --- Staff/Parent Management ---
router.route('/staff')
  .post(checkTeacherLimit, createStaff)
  .get(getStaff);
router.route('/staff/:id').delete(deleteStaff);
router.route('/parent').post(createParent);
router.route('/parents').get(getParents);

export default router;