// backend/models/School.js

import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a school name'],
      unique: true,
    },
    address: {
      type: String,
    },
    motto: {
      type: String,
    },
    logo: {
      type: String,
      default: '',
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // --- NEW FIELDS ---
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
    },
    subscriptionStatus: {
      type: String,
      enum: ['Active', 'Trialing', 'Overdue', 'Canceled'],
      default: 'Trialing',
    },
    nextBillingDate: {
      type: Date,
    },
    // --- END NEW FIELDS ---
  },
  {
    timestamps: true,
  }
);

const School = mongoose.model('School', schoolSchema);
export default School;