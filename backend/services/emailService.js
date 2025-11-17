// backend/services/emailService.js

import nodemailer from 'nodemailer';
import { currentConfig } from '../config/globalConfigStore.js';
import ActivityLog from '../models/ActivityLog.js'; // <-- Needed for logging
import DeliveryLog from '../models/DeliveryLog.js'; // <-- 1. IMPORT

let transporter;

/**
 * @desc Initializes the Nodemailer transporter using keys from the DB
 */
const initEmailService = () => {
  if (
    currentConfig.smtpHost &&
    currentConfig.smtpPort &&
    currentConfig.smtpUser &&
    currentConfig.smtpPass
  ) {
    transporter = nodemailer.createTransport({
      host: currentConfig.smtpHost,
      port: currentConfig.smtpPort,
      secure: currentConfig.smtpPort === 465,
      auth: {
        user: currentConfig.smtpUser,
        pass: currentConfig.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error('Email Service: Connection error (bypassed)', error.code);
      } else {
        console.log('Email Service is ready to send messages');
      }
    });
  } else {
    console.warn('Email Service: SMTP configuration is missing. Emails will not be sent.');
  }
};

/**
 * @desc Sends an email
 * @param {string} to - Recipient's email
 * @param {string} subject - Email subject
 * @param {string} html - Email body (as HTML)
 */
const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.warn('Email Service: Cannot send email, transporter is not initialized.');
    return;
  }

  // 1. Create a log document before sending
  const log = await DeliveryLog.create({
    recipient: to,
    type: 'EMAIL',
    subject: subject,
    status: 'INITIATED',
    details: 'Attempting to send email.',
  });

  try {
    const info = await transporter.sendMail({
      from: `"Your Library Platform" <${currentConfig.smtpUser}>`,
      to: to,
      subject: subject,
      html: html,
    });

    // 2. Update log to SUCCESS
    log.status = 'SUCCESS';
    log.details = `Message ID: ${info.messageId} (Server Response: ${info.response})`;
    await log.save();

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    // 3. Update log to FAILED
    log.status = 'FAILED';
    log.details = `SMTP Error: ${error.message}`;
    await log.save();
    
    console.error('Error sending email:', error);
  }
};

export { initEmailService, sendEmail };