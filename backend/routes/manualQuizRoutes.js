// backend/routes/manualQuizRoutes.js

import express from 'express';
const router = express.Router();
import {
  createManualQuiz,
  getQuizzesForStaff,
  getQuizzesForStudent,
  getQuizForStudent,
  submitQuizAttempt,
  getLeaderboard,
  getMyQuizAttempts, // <-- IMPORT
} from '../controllers/manualQuizController.js';
import { protect, isSchoolStaff } from '../middleware/authMiddleware.js';

// --- Student & Staff Routes ---
router.route('/student').get(protect, getQuizzesForStudent);
router.route('/student/:id').get(protect, getQuizForStudent);
router.route('/:id/submit').post(protect, submitQuizAttempt);
router.route('/leaderboard').get(protect, getLeaderboard);
router.route('/my-history').get(protect, getMyQuizAttempts); // <-- ADD THIS

// --- Staff Only Routes ---
router.route('/')
  .post(protect, isSchoolStaff, createManualQuiz)
  .get(protect, isSchoolStaff, getQuizzesForStaff);

export default router;