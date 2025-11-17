// backend/models/ActivityLog.js

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: false, // Developer actions won't have a school
    },
    action: {
      type: String,
      required: true,
      // e.g., "USER_LOGIN", "CREATED_BOOK", "DELETED_STUDENT"
    },
    details: {
      type: String, // e.g., "User John Doe logged in."
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.plugin(mongoosePaginate);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;