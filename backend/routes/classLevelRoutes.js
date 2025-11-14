// backend/routes/classLevelRoutes.js

import express from 'express';
const router = express.Router();
import { createClassLevel, getClassLevels } from '../controllers/classLevelController.js';
import { protect, isSchoolAdmin, isSchoolStaff } from '../middleware/authMiddleware.js';

router.route('/')
  .post(protect, isSchoolAdmin, createClassLevel) // Only Admins can create
  .get(protect, isSchoolStaff, getClassLevels);    // All staff can view

export default router;