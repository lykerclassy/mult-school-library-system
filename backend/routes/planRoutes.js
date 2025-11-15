// backend/routes/planRoutes.js

import express from 'express';
const router = express.Router();
import {
  createPlan,
  getPlans,
  deletePlan,
} from '../controllers/planController.js';
import { protect, isDeveloper } from '../middleware/authMiddleware.js';

// All routes are for Developer only
router.use(protect, isDeveloper);

router.route('/')
  .post(createPlan)
  .get(getPlans);

router.route('/:id')
  .delete(deletePlan);
  // We can add PUT for updating plans later

export default router;