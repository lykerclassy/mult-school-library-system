// backend/models/Notification.js

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      // The user account (student, admin, etc.)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String, // Optional URL to link to (e.g., /my-books)
      default: '#',
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;