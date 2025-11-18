// backend/routes/authRoutes.js

import express from 'express';
const router = express.Router();
import {
  registerDeveloper,
  loginUser,
  checkUserByEmail,
  logoutUser,
  getMe,
  demoLogin,
  impersonateUser, // <-- IMPORT
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register-developer', registerDeveloper);
router.post('/login', loginUser);
router.post('/demo-login', demoLogin);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.post('/impersonate', protect, impersonateUser); // <-- ADD THIS ROUTE

export default router;