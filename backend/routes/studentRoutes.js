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
  getStudentsByClass,       // <-- IMPORT
  getUnassignedStudents,    // <-- IMPORT
  unassignStudentFromClass, // <-- IMPORT
} from '../controllers/studentController.js';
import {
  protect,
  isSchoolAdmin,
  isSchoolStaff,
} from '../middleware/authMiddleware.js';
import { checkStudentLimit } from '../middleware/limitMiddleware.js';

// All routes are protected and for school staff
router.use(protect, isSchoolStaff);

router.route('/').get(getStudents);

// --- NEW ROUTES ---
router.route('/class/:classId').get(getStudentsByClass);
router.route('/unassigned').get(getUnassignedStudents);
// --- END NEW ROUTES ---

// Admin-only routes
router.route('/').post(isSchoolAdmin, checkStudentLimit, addStudent);

router
  .route('/:id')
  .get(getStudentById)
  .put(isSchoolAdmin, updateStudent)
  .delete(isSchoolAdmin, deleteStudent);

router.route('/:id/link-parent').put(isSchoolAdmin, linkParentToStudent);
router.route('/:id/assign-class').put(isSchoolAdmin, assignClassToStudent);

// --- NEW ROUTE ---
router.route('/:studentId/unassign-class').put(isSchoolAdmin, unassignStudentFromClass);

export default router;