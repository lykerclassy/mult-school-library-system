// backend/services/intasendService.js

import IntaSend from 'intasend-node';
import { currentConfig } from '../config/globalConfigStore.js';

let intasend;

const initIntasend = () => {
  if (
    currentConfig.intasendPubKey &&
    currentConfig.intasendSecretKey
  ) {
    
    // --- THIS IS THE FIX ---
    // Swapped the order of the keys.
    // The constructor is (publishable_key, token, testbed)
    intasend = new IntaSend(
      currentConfig.intasendPubKey,   // 1. Public Key
      currentConfig.intasendSecretKey, // 2. Secret Key (Token)
      false // 3. Testbed (false = live)
    );
    // --- END OF FIX ---

    console.log('IntaSend Service is initialized.');
  } else {
    console.warn('IntaSend Service: Credentials are missing. Payments will fail.');
  }
};

const getIntasend = () => {
  if (!intasend) {
    throw new Error('IntaSend Service is not initialized.');
  }
  return intasend;
};

export { initIntasend, getIntasend };