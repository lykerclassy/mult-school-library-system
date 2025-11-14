// backend/routes/userRoutes.js

import express from 'express';
const router = express.Router();
import { createStaff, getStaff } from '../controllers/userController.js';
import { protect, isSchoolAdmin } from '../middleware/authMiddleware.js';

// All routes in this file are protected and require School Admin access
router.use(protect, isSchoolAdmin);

router.route('/staff').post(createStaff).get(getStaff);

export default router;