// backend/routes/analyticsRoutes.js

import express from 'express';
const router = express.Router();
import {
  getDashboardAnalytics,
  generateAllBooksReport,
  getDeveloperAnalytics,
} from '../controllers/analyticsController.js';
import { protect, isSchoolStaff, isDeveloper } from '../middleware/authMiddleware.js';

// Developer-specific route
router.get('/developer', protect, isDeveloper, getDeveloperAnalytics);

// School Staff routes
router.use(protect, isSchoolStaff);
router.get('/dashboard', getDashboardAnalytics);
router.get('/reports/all-books', generateAllBooksReport);

export default router;