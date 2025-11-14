// backend/models/School.js

import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a school name'],
      unique: true, // This is the only index we need for 'name'
    },
    address: {
      type: String,
    },
    motto: {
      type: String,
    },
    logo: {
      type: String, // URL from Cloudinary
      default: '',
    },
    admin: {
      // The main SchoolAdmin account for this school
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// We remove any extra 'schoolSchema.index({ name: 1 })' from here

const School = mongoose.model('School', schoolSchema);
export default School;