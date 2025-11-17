// backend/models/DeliveryLog.js

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const deliveryLogSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // For system/automation errors
    },
    recipient: {
      type: String, // Email or Phone Number
      required: true,
    },
    type: {
      type: String,
      enum: ['EMAIL', 'SMS'],
      required: true,
    },
    subject: {
      type: String,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'INITIATED'],
      required: true,
    },
    details: {
      type: String, // Full error message or success ID
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

deliveryLogSchema.plugin(mongoosePaginate);
const DeliveryLog = mongoose.model('DeliveryLog', deliveryLogSchema);
export default DeliveryLog;