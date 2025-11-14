// backend/routes/notificationRoutes.js

import express from 'express';
const router = express.Router();
import {
  getMyNotifications,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

// All routes are protected
router.use(protect);

router.route('/').get(getMyNotifications);
router.route('/mark-read').post(markAllAsRead);

export default router;