// backend/routes/billingRoutes.js

import express from 'express';
const router = express.Router();
import {
  initiatePayment,
  handleWebhook,
  verifyWebhook,
  getPaymentStatus,
  generateInvoice, // <-- IMPORT
} from '../controllers/billingController.js';
import { protect, isSchoolAdmin, isDeveloper } from '../middleware/authMiddleware.js'; // <-- IMPORT isDeveloper

// --- Public Webhook ---
router.route('/webhook')
  .get(verifyWebhook)
  .post(handleWebhook);

// --- Private Admin/Staff Routes ---
router.use(protect); // Global protection for all below

// Route for Admins to initiate payment
router.route('/initiate-payment').post(isSchoolAdmin, initiatePayment);
router.route('/status/:paymentId').get(isSchoolAdmin, getPaymentStatus);
// Route for Admins OR Developer to view the invoice
router.route('/invoices/:paymentId').get(generateInvoice);

export default router;