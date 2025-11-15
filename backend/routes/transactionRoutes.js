// backend/routes/transactionRoutes.js

import express from 'express';
const router = express.Router();
import {
  issueBook,
  returnBook,
  getTransactions,
  getMyTransactions,
  payFine, // <-- IMPORT
} from '../controllers/transactionController.js';
import { protect, isSchoolStaff } from '../middleware/authMiddleware.js';

// --- Student Route ---
router.route('/my-history').get(protect, getMyTransactions);

// --- Staff Routes ---
router.use(protect, isSchoolStaff);

router.route('/').get(getTransactions);
router.route('/issue').post(issueBook);
router.route('/:id/return').post(returnBook);
router.route('/:id/pay-fine').post(payFine); // <-- ADDED

export default router;