// backend/routes/timetableRoutes.js

import express from 'express';
const router = express.Router();
import {
  createTimetableEntry,
  getTimetableForClass,
  getMyTimetable,
  deleteTimetableEntry,
} from '../controllers/timetableController.js';
import { protect, isSchoolAdmin, isSchoolStaff } from '../middleware/authMiddleware.js';

// --- Student Route ---
router.route('/my-timetable').get(protect, getMyTimetable);

// --- Staff/Admin Routes ---
router.use(protect, isSchoolStaff);
router.route('/class/:classId').get(getTimetableForClass);

// --- Admin Only Routes ---
router.use(protect, isSchoolAdmin);
router.route('/').post(createTimetableEntry);
router.route('/:id').delete(deleteTimetableEntry);

export default router;