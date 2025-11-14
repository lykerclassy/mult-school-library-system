// backend/routes/studentRoutes.js

import express from 'express';
const router = express.Router();
import {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import {
  protect,
  isSchoolAdmin,
  isSchoolStaff,
} from '../middleware/authMiddleware.js';

// All routes are protected and for school staff
router.use(protect, isSchoolStaff);

// GET /api/v1/students (Staff can view)
router.route('/').get(getStudents);

// POST /api/v1/students (Admin only)
router.route('/').post(isSchoolAdmin, addStudent);

// Routes for a specific student ID
router
  .route('/:id')
  .get(getStudentById) // Staff can view
  .put(isSchoolAdmin, updateStudent) // Admin only
  .delete(isSchoolAdmin, deleteStudent); // Admin only

export default router;