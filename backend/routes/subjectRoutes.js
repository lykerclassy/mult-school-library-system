// backend/routes/subjectRoutes.js

import express from 'express';
const router = express.Router();
import { createSubject, getSubjects } from '../controllers/subjectController.js';
import { protect, isSchoolAdmin } from '../middleware/authMiddleware.js';

// --- THIS IS THE FIX ---
// GET /api/v1/subjects: Now open to ANY logged-in user (role is checked by 'protect')
router.route('/').get(protect, getSubjects);
// --- END OF FIX ---

// POST /api/v1/subjects: Still locked to Admins only
router.route('/').post(protect, isSchoolAdmin, createSubject);

export default router;