// backend/routes/billingRoutes.js

import express from 'express';
const router = express.Router();
import {
  initiatePayment,
  handleWebhook,
  verifyWebhook,
  getPaymentStatus,
  generateInvoice, // <-- This import will now work
} from '../controllers/billingController.js';
import { protect, isSchoolAdmin, isDeveloper } from '../middleware/authMiddleware.js';

// --- Public Webhook ---
router.route('/webhook')
  .get(verifyWebhook)
  .post(handleWebhook);

// --- Private Admin/Staff Routes ---
router.use(protect);

router.route('/initiate-payment').post(isSchoolAdmin, initiatePayment);
router.route('/status/:paymentId').get(isSchoolAdmin, getPaymentStatus);
router.route('/invoices/:paymentId').get(generateInvoice); // This route is shared

export default router;