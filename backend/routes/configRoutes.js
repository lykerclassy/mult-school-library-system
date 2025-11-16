// backend/routes/configRoutes.js

import express from 'express';
const router = express.Router();
import {
  getGlobalConfig,
  updateGlobalConfig,
} from '../controllers/configController.js';
import { protect, isDeveloper } from '../middleware/authMiddleware.js';

// All routes are for Developer only
router.use(protect, isDeveloper);

router.route('/')
  .get(getGlobalConfig)
  .put(updateGlobalConfig);

export default router;