// backend/routes/authRoutes.js

import express from 'express';
const router = express.Router();
import {
  registerDeveloper,
  loginUser,
  checkUserByEmail, // <-- IMPORT
  logoutUser,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

// Public Routes
router.post('/register-developer', registerDeveloper);
router.post('/login', loginUser);
router.post('/check-email', checkUserByEmail); // <-- ADD NEW ROUTE
router.post('/logout', logoutUser);

// Private Route
router.get('/me', protect, getMe);

export default router;