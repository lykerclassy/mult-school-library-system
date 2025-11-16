// backend/config/globalConfigStore.js

import GlobalConfig from '../models/GlobalConfig.js';

// This object will hold our keys in memory
let currentConfig = {};

/**
 * @desc Fetches the config from the DB and loads it into the exported 'currentConfig'
 */
const loadConfigFromDB = async () => {
  try {
    console.log('Loading global configuration from database...');
    let config = await GlobalConfig.findOne({ configId: 'main_config' });

    if (!config) {
      console.log('No config found, creating a new one...');
      config = await GlobalConfig.create({ configId: 'main_config' });
    }

    // We no longer read from process.env for these keys
    currentConfig = {
      googleAiKey: config.googleAiKey,
      openAiKey: config.openAiKey,
      cloudinaryCloudName: config.cloudinaryCloudName,
      cloudinaryApiKey: config.cloudinaryApiKey,
      cloudinaryApiSecret: config.cloudinaryApiSecret,
      intasendPubKey: config.intasendPubKey,
      intasendSecretKey: config.intasendSecretKey,
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpUser: config.smtpUser,
      smtpPass: config.smtpPass,
    };
    
    console.log('Global configuration loaded successfully.');
    
  } catch (error) {
    console.error('CRITICAL ERROR: Could not load global config from DB.', error);
    process.exit(1); // Exit server if config can't be loaded
  }
};

// We export the config object itself, which will be updated on startup
export { currentConfig, loadConfigFromDB };