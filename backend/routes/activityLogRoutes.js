// backend/routes/activityLogRoutes.js

import express from 'express';
const router = express.Router();
import { getAllLogs, getDeliveryLogs } from '../controllers/activityLogController.js';
import { protect, isDeveloper } from '../middleware/authMiddleware.js';

// All routes are for Developer only
router.use(protect, isDeveloper);

// Activity Log
router.route('/activity').get(getAllLogs); // Renamed endpoint for clarity

// Delivery Log
router.route('/delivery').get(getDeliveryLogs); // <-- ADD THIS

export default router;