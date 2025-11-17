// backend/controllers/configController.js

import asyncHandler from 'express-async-handler';
import GlobalConfig from '../models/GlobalConfig.js';
import { sendSms } from '../services/smsService.js'; // <-- 1. IMPORT

// --- (getGlobalConfig & updateGlobalConfig are unchanged) ---
const getGlobalConfig = asyncHandler(async (req, res) => {
  let config = await GlobalConfig.findOne({ configId: 'main_config' });
  if (!config) {
    config = await GlobalConfig.create({ configId: 'main_config' });
  }
  res.status(200).json(config);
});

const updateGlobalConfig = asyncHandler(async (req, res) => {
  const configData = req.body;
  const updatedConfig = await GlobalConfig.findOneAndUpdate(
    { configId: 'main_config' },
    { ...configData, lastUpdatedBy: req.user._id },
    { new: true, upsert: true }
  );
  res.status(200).json(updatedConfig);
});

// --- NEW FUNCTION ---
/**
 * @desc    Send a test SMS
 * @route   POST /api/v1/config/test-sms
 * @access  Private (Developer)
 */
const testSmsConfig = asyncHandler(async (req, res) => {
  const { testPhoneNumber } = req.body;

  if (!testPhoneNumber) {
    res.status(400);
    throw new Error('Test phone number is required');
  }
  
  // Basic check for international format
  if (!testPhoneNumber.startsWith('+')) {
    res.status(400);
    throw new Error('Phone number must be in international format (e.g., +254712345678)');
  }

  try {
    const message = 'This is a test message from your new Library SaaS platform! It works!';
    await sendSms(testPhoneNumber, message);
    res.status(200).json({ message: 'Test SMS sent successfully!' });
  } catch (error) {
    res.status(500);
    throw new Error(`SMS failed: ${error.message}`);
  }
});


export { 
  getGlobalConfig, 
  updateGlobalConfig,
  testSmsConfig // <-- 2. EXPORT
};