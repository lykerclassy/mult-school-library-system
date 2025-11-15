// backend/models/Plan.js

import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number, // Stored in lowest currency unit (e.g., cents)
      required: true,
    },
    studentLimit: {
      type: Number,
      required: true,
    },
    teacherLimit: {
      type: Number,
      required: true,
    },
    features: [
      {
        type: String,
      },
    ],
    // 'Developer' or 'Host' owns the plans, so no 'school' ref
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model('Plan', planSchema);
export default Plan;