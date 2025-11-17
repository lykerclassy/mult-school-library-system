// backend/services/smsService.js

import AfricasTalking from 'africastalking';
import { currentConfig } from '../config/globalConfigStore.js';
import DeliveryLog from '../models/DeliveryLog.js'; // <-- 1. IMPORT

let africastalking;
let sms;

const initSmsService = () => {
  if (currentConfig.smsUsername && currentConfig.smsApiKey && currentConfig.smsSenderId) {
    try {
      africastalking = AfricasTalking({
        apiKey: currentConfig.smsApiKey,
        username: currentConfig.smsUsername,
      });
      sms = africastalking.SMS;
      console.log('SMS Service (Africa\'s Talking) is initialized.');
    } catch (error) {
      console.error("Failed to initialize SMS service:", error.message);
    }
  } else {
    console.warn('SMS Service: Credentials (username, apiKey, or SenderId) are missing. SMS will not be sent.');
  }
};

const sendSms = async (to, message) => {
  if (!sms) {
    throw new Error('SMS Service not configured. Check system settings.');
  }
  
  if (!currentConfig.smsSenderId) {
    throw new Error('SMS Sender ID is not configured.');
  }

  // 1. Create a log document before sending
  const log = await DeliveryLog.create({
    recipient: to,
    type: 'SMS',
    subject: message.substring(0, 50), // Use first 50 chars as subject
    status: 'INITIATED',
    details: 'Attempting to send SMS.',
  });

  try {
    const response = await sms.send({
      to: [to],
      message: message,
      from: currentConfig.smsSenderId,
    });
    
    const recipient = response.SMSMessageData.Recipients[0];
    
    if (recipient.status === 'Success' || recipient.statusCode === 101) { // 101 is queued/success
        // 2. Update log to SUCCESS
        log.status = 'SUCCESS';
        log.details = `AT Status: ${recipient.status} | Cost: ${recipient.cost}`;
        await log.save();
        return response;
    } else {
        // 3. Update log to FAILED
        log.status = 'FAILED';
        log.details = `AT Error: ${recipient.status} - ${recipient.message}`;
        await log.save();
        throw new Error(`Africa's Talking Error: ${recipient.message}`);
    }
  } catch (error) {
    // If the API call itself failed (not just the send), update the log
    if (log.status === 'INITIATED') {
        log.status = 'FAILED';
        log.details = `API Call Failed: ${error.message}`;
        await log.save();
    }
    console.error('Error sending SMS:', error.toString());
    throw new Error(`Failed to send SMS: ${error.message || error}`);
  }
};

export { initSmsService, sendSms };