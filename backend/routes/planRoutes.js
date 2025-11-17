// backend/routes/planRoutes.js

import express from 'express';
const router = express.Router();
import {
  createPlan,
  getPlans,
  deletePlan,
} from '../controllers/planController.js';
import { protect, isDeveloper, isSchoolAdmin } from '../middleware/authMiddleware.js';

// Allow SchoolAdmins OR Developers to GET plans
router.route('/').get(protect, getPlans);

// --- Developer Only Routes ---
router.use(protect, isDeveloper);
router.route('/').post(createPlan);
router.route('/:id').delete(deletePlan);

export default router;