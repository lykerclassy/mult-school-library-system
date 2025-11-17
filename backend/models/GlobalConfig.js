// backend/models/GlobalConfig.js

import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  configId: {
    type: String,
    default: 'main_config',
    unique: true,
  },
  
  // AI Keys
  googleAiKey: { type: String },
  openAiKey: { type: String },

  // Storage Keys
  cloudinaryCloudName: { type: String },
  cloudinaryApiKey: { type: String },
  cloudinaryApiSecret: { type: String },

  // Payment Keys
  intasendPubKey: { type: String },
  intasendSecretKey: { type: String },

  // Email SMTP
  smtpHost: { type: String },
  smtpPort: { type: Number },
  smtpUser: { type: String },
  smtpPass: { type: String },
  
  // SMS Gateway
  smsUsername: { type: String },
  smsApiKey: { type: String },
  // --- NEW FIELD ---
  smsSenderId: { type: String }, // e.g., "MySaaS" or "20123"
  // --- END NEW FIELD ---
  
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const GlobalConfig = mongoose.model('GlobalConfig', configSchema);
export default GlobalConfig;