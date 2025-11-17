// backend/config/globalConfigStore.js

import GlobalConfig from '../models/GlobalConfig.js';

// This object will hold our keys in memory
// All other files import a reference to THIS object
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

    // --- THIS IS THE FIX ---
    // We are not re-assigning currentConfig with '='
    // We are *mutating* the existing object, so all services that
    // imported it will see the new values.
    Object.assign(currentConfig, {
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
      smsUsername: config.smsUsername,
      smsApiKey: config.smsApiKey,
    });
    // --- END OF FIX ---
    
    console.log('Global configuration loaded successfully.');
    
  } catch (error) {
    console.error('CRITICAL ERROR: Could not load global config from DB.', error);
    process.exit(1);
  }
};

// We export the config object itself, which will be updated on startup
export { currentConfig, loadConfigFromDB };