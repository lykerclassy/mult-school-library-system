// backend/services/emailService.js

import nodemailer from 'nodemailer';
import { currentConfig } from '../config/globalConfigStore.js';

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
      secure: currentConfig.smtpPort === 465, // true for 465, false for others
      auth: {
        user: currentConfig.smtpUser,
        pass: currentConfig.smtpPass,
      },
      // --- THIS IS THE FIX ---
      // This tells Node.js to not fail if the certificate name doesn't match
      tls: {
        rejectUnauthorized: false,
      },
      // --- END OF FIX ---
    });

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        // We will still see the error here, but it won't crash
        console.error('Email Service: Connection error (bypassed)', error.code);
      } else {
        console.log('Email Service is ready to send messages (insecure mode)');
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

  try {
    const info = await transporter.sendMail({
      from: `"Your Library Platform" <${currentConfig.smtpUser}>`, // Sender address
      to: to,
      subject: subject,
      html: html,
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export { initEmailService, sendEmail };