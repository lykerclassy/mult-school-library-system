// backend/routes/analyticsRoutes.js

import express from 'express';
const router = express.Router();
import {
  getDashboardAnalytics,
  generateAllBooksReport,
  getDeveloperAnalytics,
} from '../controllers/analyticsController.js';
import { protect, isSchoolStaff, isDeveloper } from '../middleware/authMiddleware.js';

// --- THIS IS THE FIX ---
// 1. The Developer-specific route must come FIRST.
router.get('/developer', protect, isDeveloper, getDeveloperAnalytics);

// --- END OF FIX ---


// --- School Staff Routes ---
// 2. This middleware now applies to all routes *below* it.
router.use(protect, isSchoolStaff);

router.get('/dashboard', getDashboardAnalytics);
router.get('/reports/all-books', generateAllBooksReport);

export default router;