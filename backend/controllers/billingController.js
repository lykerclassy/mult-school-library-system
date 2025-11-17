// backend/controllers/billingController.js

import asyncHandler from 'express-async-handler';
import { getIntasend } from '../services/intasendService.js';
import Plan from '../models/Plan.js';
import School from '../models/School.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { generateInvoicePDF } from '../services/invoiceService.js'; // <-- 1. IMPORT

/**
 * @desc    Initiate an STK push payment
 * @route   POST /api/v1/billing/initiate-payment
 * @access  Private (SchoolAdmin)
 */
const initiatePayment = asyncHandler(async (req, res) => {
  const { planId, phoneNumber } = req.body;
  const schoolId = req.user.school;

  const plan = await Plan.findById(planId);
  if (!plan) {
    res.status(404); throw new Error('Plan not found');
  }

  const amountToPay = plan.price / 100;

  const payment = new Payment({
    school: schoolId,
    plan: planId,
    amount: amountToPay,
    status: 'Pending',
    phoneNumber: phoneNumber,
    intasendInvoiceId: payment._id.toString(), // Unique temp ID
  });
  await payment.save();

  const intasend = getIntasend();
  const collection = intasend.collection();
  
  const response = await collection.mpesaStkPush({
    first_name: req.user.name,
    last_name: 'Admin',
    email: req.user.email,
    phone_number: phoneNumber,
    amount: amountToPay,
    api_ref: `payment_${payment._id}`,
  });

  payment.intasendInvoiceId = response.invoice.invoice_id;
  await payment.save();

  res.status(200).json({ 
    message: 'STK push initiated. Please check your phone.', 
    paymentId: payment._id 
  });
});

/**
 * @desc    IntaSend Webhook
 * @route   POST /api/v1/billing/webhook
 * @access  Public
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const data = req.body;
  console.log('--- IntaSend Webhook Received ---', data);

  const invoiceId = data.invoice_id;
  const apiRef = data.api_ref;
  const state = data.state;

  let payment = await Payment.findOne({ intasendInvoiceId: invoiceId });
  
  // Fallback check
  if (!payment && apiRef) {
    const paymentId = apiRef.split('_')[1];
    payment = await Payment.findById(paymentId);
    if(payment) {
      payment.intasendInvoiceId = invoiceId;
    }
  }
  
  if (!payment) {
    console.error(`Webhook Error: Payment with invoice ${invoiceId} not found.`);
    return res.status(404).send('Payment not found');
  }

  if(payment.status === 'Completed' || payment.status === 'Failed') {
    return res.status(200).send('Webhook already processed.');
  }

  if (state === 'COMPLETE') {
    const school = await School.findById(payment.school);
    const plan = await Plan.findById(payment.plan);
    
    if (!school || !plan) {
      console.error(`Webhook Error: School or Plan not found for payment ${payment._id}`);
      return res.status(404).send('School or Plan not found');
    }

    // 1. Upgrade the school
    school.plan = payment.plan;
    school.subscriptionStatus = 'Active';
    const newBillingDate = new Date();
    newBillingDate.setMonth(newBillingDate.getMonth() + 1);
    school.nextBillingDate = newBillingDate;
    
    // --- 2. GENERATE AND UPLOAD INVOICE ---
    // Populate the admin details needed for the invoice template
    const adminUser = await User.findById(school.admin).select('name email');
    school.admin = adminUser;
    
    const invoiceUrl = await generateInvoicePDF(payment, school, plan);
    payment.invoiceUrl = invoiceUrl; // Save the URL
    // --- END INVOICE GENERATION ---

    await school.save();

    // 3. Mark payment as complete
    payment.status = 'Completed';
    await payment.save();

    // 4. Notify the Developer
    const developer = await User.findOne({ role: 'Developer' });
    if (developer) {
      await Notification.create({
        user: developer._id,
        school: school._id,
        message: `Payment of KES ${payment.amount} received from ${school.name} for ${plan.name} plan.`,
        link: '/dev/support',
      });
    }
  } 
  else if (state === 'FAILED') {
    payment.status = 'Failed';
    await payment.save();
    console.log(`Payment ${invoiceId} marked as FAILED.`);
  }

  res.status(200).send('Webhook received');
});

/**
 * @desc    Responds to IntaSend's one-time webhook verification
 * @route   GET /api/v1/billing/webhook
 * @access  Public
 */
const verifyWebhook = asyncHandler(async (req, res) => {
  const challenge = req.query.challenge;
  if (challenge) {
    console.log('--- IntaSend Webhook Challenge Received ---');
    res.status(200).send(challenge);
  } else {
    res.status(400).send('No challenge token provided');
  }
});

/**
 * @desc    Check the status of a specific payment
 * @route   GET /api/v1/billing/status/:paymentId
 * @access  Private (SchoolAdmin)
 */
const getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({
    _id: req.params.paymentId,
    school: req.user.school,
  });

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  res.status(200).json({ status: payment.status });
});

/**
 * @desc    Generate a PDF invoice for a completed payment
 * @route   GET /api/v1/billing/invoices/:paymentId
 * @access  Private (Developer, SchoolAdmin)
 */
const generateInvoice = asyncHandler(async (req, res) => {
  const paymentId = req.params.paymentId;

  // 1. Fetch data
  const payment = await Payment.findById(paymentId).populate('school plan');
  
  if (!payment || payment.status !== 'Completed') {
    res.status(404);
    throw new Error('Invoice not found or payment incomplete.');
  }

  // 2. Security Check: Only the paying school's admin or the Developer can view
  if (req.user.role !== 'Developer' && payment.school._id.toString() !== req.user.school.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this invoice.');
  }
  
  // 3. Trigger download
  if (!payment.invoiceUrl) {
    res.status(404);
    throw new Error('Invoice file not found in storage. Please contact support.');
  }
  
  // Redirect to Cloudinary URL to initiate download
  res.redirect(payment.invoiceUrl);
});


export { 
  initiatePayment, 
  handleWebhook,
  verifyWebhook,
  getPaymentStatus,
  generateInvoice // <-- EXPORT
};