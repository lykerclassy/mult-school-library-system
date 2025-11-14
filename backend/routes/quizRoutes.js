// backend/routes/quizRoutes.js

import express from 'express';
const router = express.Router();
import {
  generateQuiz,
  getQuizHistory,
  getQuizById,
} from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';

// All routes are protected
router.use(protect);

router.route('/generate').post(generateQuiz);
router.route('/history').get(getQuizHistory);
router.route('/:id').get(getQuizById);

export default router;