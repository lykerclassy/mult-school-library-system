// backend/routes/classLevelRoutes.js

import express from 'express';
const router = express.Router();
import { createClassLevel, getClassLevels } from '../controllers/classLevelController.js';
import { protect, isSchoolAdmin } from '../middleware/authMiddleware.js';

// --- THIS IS THE FIX ---
// GET /api/v1/classes: Now open to ANY logged-in user (role is checked by 'protect')
router.route('/').get(protect, getClassLevels);
// --- END OF FIX ---

// POST /api/v1/classes: Still locked to Admins only
router.route('/').post(protect, isSchoolAdmin, createClassLevel);

export default router;