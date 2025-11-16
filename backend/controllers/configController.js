// backend/controllers/configController.js

import asyncHandler from 'express-async-handler';
import GlobalConfig from '../models/GlobalConfig.js';

/**
 * @desc    Get the global configuration
 * @route   GET /api/v1/config
 * @access  Private (Developer)
 */
const getGlobalConfig = asyncHandler(async (req, res) => {
  // Find the one and only config document, or create it if it doesn't exist
  let config = await GlobalConfig.findOne({ configId: 'main_config' });

  if (!config) {
    config = await GlobalConfig.create({ configId: 'main_config' });
  }

  res.status(200).json(config);
});

/**
 * @desc    Update the global configuration
 * @route   PUT /api/v1/config
 * @access  Private (Developer)
 */
const updateGlobalConfig = asyncHandler(async (req, res) => {
  const configData = req.body;
  
  const updatedConfig = await GlobalConfig.findOneAndUpdate(
    { configId: 'main_config' }, // Find the one document
    {
      ...configData, // Set all new values from the form
      lastUpdatedBy: req.user._id,
    },
    {
      new: true, // Return the updated document
      upsert: true, // Create it if it doesn't exist
    }
  );

  res.status(200).json(updatedConfig);
});

export { getGlobalConfig, updateGlobalConfig };