// backend/routes/analyticsRoutes.js

import express from 'express';
const router = express.Router();
import {
  getDashboardAnalytics,
  generateAllBooksReport,
} from '../controllers/analyticsController.js';
import { protect, isSchoolStaff } from '../middleware/authMiddleware.js';

// All routes are for staff
router.use(protect, isSchoolStaff);

router.get('/dashboard', getDashboardAnalytics);
router.get('/reports/all-books', generateAllBooksReport);

export default router;