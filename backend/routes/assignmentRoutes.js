// backend/routes/assignmentRoutes.js

import express from 'express';
const router = express.Router();
import {
  createAssignment,
  getAssignmentsForTeacher,
  getAssignmentsForStudent,
  getAssignmentByIdForStudent,
  submitAssignment,
  getSubmissionsForAssignment,
  gradeSubmission,
  getAssignmentsForParent,
  getAssignmentByIdForTeacher, // <-- IMPORT
  updateAssignment,            // <-- IMPORT
  deleteAssignment,            // <-- IMPORT
} from '../controllers/assignmentController.js';
import { protect, isSchoolStaff } from '../middleware/authMiddleware.js';
import { fileUpload } from '../middleware/uploadMiddleware.js';

// --- Student & Parent Routes ---
router.route('/student').get(protect, getAssignmentsForStudent);
router.route('/student/:id').get(protect, getAssignmentByIdForStudent);
router.route('/parent').get(protect, getAssignmentsForParent);
router.route('/:id/submit').post(protect, fileUpload.single('file'), submitAssignment);

// --- Staff (Teacher) Routes ---
router.use(protect, isSchoolStaff);

router.route('/')
  .post(createAssignment);

router.route('/my-assignments')
  .get(getAssignmentsForTeacher);
  
router.route('/:id/submissions').get(getSubmissionsForAssignment);

// --- NEW TEACHER ROUTES ---
router.route('/:id')
  .get(getAssignmentByIdForTeacher) // Get single assignment for editing
  .put(updateAssignment)            // Update an assignment
  .delete(deleteAssignment);       // Delete an assignment

router.route('/submissions/:id/grade').put(gradeSubmission);

export default router;