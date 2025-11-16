// backend/routes/studentRoutes.js

import express from 'express';
const router = express.Router();
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  linkParentToStudent,
  assignClassToStudent,
} from '../controllers/studentController.js';
import {
  protect,
  isSchoolAdmin,
  isSchoolStaff,
} from '../middleware/authMiddleware.js';
import { checkStudentLimit } from '../middleware/limitMiddleware.js'; // <-- 1. IMPORT

// All routes are protected and for school staff
router.use(protect, isSchoolStaff);

router.route('/').get(getStudents);

// Admin-only routes
router
  .route('/')
  .post(isSchoolAdmin, checkStudentLimit, addStudent); // <-- 2. ADD MIDDLEWARE

router
  .route('/:id')
  .get(getStudentById)
  .put(isSchoolAdmin, updateStudent)
  .delete(isSchoolAdmin, deleteStudent);

router.route('/:id/link-parent').put(isSchoolAdmin, linkParentToStudent);
router.route('/:id/assign-class').put(isSchoolAdmin, assignClassToStudent);

export default router;