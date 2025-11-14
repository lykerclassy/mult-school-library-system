// backend/routes/subjectRoutes.js

import express from 'express';
const router = express.Router();
import { createSubject, getSubjects } from '../controllers/subjectController.js';
import { protect, isSchoolAdmin, isSchoolStaff } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protect, isSchoolAdmin, createSubject) // Only Admins can create
  .get(protect, isSchoolStaff, getSubjects);    // All staff can view

export default router;