// backend/routes/configRoutes.js

import express from 'express';
const router = express.Router();
import {
  getGlobalConfig,
  updateGlobalConfig,
  testSmsConfig, // <-- 1. IMPORT
} from '../controllers/configController.js';
import { protect, isDeveloper } from '../middleware/authMiddleware.js';

router.use(protect, isDeveloper);

router.route('/')
  .get(getGlobalConfig)
  .put(updateGlobalConfig);

// --- NEW ROUTE ---
router.route('/test-sms')
  .post(testSmsConfig); // <-- 2. ADD

export default router;