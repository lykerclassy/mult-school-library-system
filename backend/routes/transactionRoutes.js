// backend/routes/transactionRoutes.js

import express from 'express';
const router = express.Router();
import {
  issueBook,
  returnBook,
  getTransactions,
  getMyTransactions, // <-- IMPORT
} from '../controllers/transactionController.js';
import { protect, isSchoolStaff } from '../middleware/authMiddleware.js';

// --- Student Route ---
// This route is just for the logged-in user (student)
router.route('/my-history').get(protect, getMyTransactions);

// --- Staff Routes ---
// These routes are protected and for School Staff (Librarians & Admins)
router.use(protect, isSchoolStaff);

router.route('/').get(getTransactions);
router.route('/issue').post(issueBook);
router.route('/:id/return').post(returnBook);

export default router;