// backend/models/Payment.js

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    amount: {
      type: Number, // Stored in KES
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending',
    },
    intasendInvoiceId: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    // --- NEW FIELD ---
    invoiceUrl: {
      type: String, // URL to the generated PDF receipt
    },
    // --- END NEW FIELD ---
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;