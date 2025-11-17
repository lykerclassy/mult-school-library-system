// backend/services/invoiceService.js

import PDFDocument from 'pdfkit';
import { cloudinary } from '../config/cloudinary.js';
import streamifier from 'streamifier';
import { format } from 'date-fns';

/**
 * @desc Generates a subscription invoice/receipt PDF and uploads it to Cloudinary.
 * @param {object} payment - The payment document.
 * @param {object} school - The school document (with admin populated).
 * @param {object} plan - The plan document.
 * @returns {string} The Cloudinary URL of the generated invoice.
 */
const generateInvoicePDF = async (payment, school, plan) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        
        // --- Upload to Cloudinary ---
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'invoices',
                    resource_type: 'raw', // Treat as a file (PDF)
                    public_id: `INV-${payment.intasendInvoiceId}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                }
            );
            streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
        });

        resolve(result.secure_url);
      } catch (error) {
        reject(error);
      }
    });

    // --- PDF LAYOUT ---
    const primaryColor = '#1D4ED8';
    const secondaryColor = '#4B5563';
    const bold = 'Helvetica-Bold';
    const regular = 'Helvetica';

    // Title
    doc.fontSize(25).fillColor(primaryColor).font(bold).text('INVOICE / RECEIPT', 50, 60);
    
    // Developer Details (Top Right)
    doc.fontSize(10).fillColor(secondaryColor).font(regular).text('Developer SaaS Platform', 400, 65, { align: 'right' });
    doc.text('Payments Department', 400, 80, { align: 'right' });
    
    // Line Break
    doc.strokeColor(secondaryColor).lineWidth(1).moveTo(50, 110).lineTo(565, 110).stroke();

    // Invoice/Bill To Details (Left Side)
    doc.moveDown(1);
    doc.fontSize(12).font(bold).text('INVOICED TO:', 50, doc.y);
    doc.fontSize(10).font(regular).text(school.name, 50, doc.y + 15);
    doc.text(`Admin: ${school.admin.name} (${school.admin.email})`, 50, doc.y + 30);
    doc.text(`Phone: ${payment.phoneNumber}`, 50, doc.y + 45);

    doc.moveDown(5);

    // Items Table Header
    doc.fillColor(secondaryColor).rect(50, doc.y, 515, 20).fill();
    doc.fillColor('#FFFFFF').font(bold).fontSize(10).text('DESCRIPTION', 60, doc.y + 5);
    doc.text('PLAN', 300, doc.y + 5);
    doc.text('AMOUNT (KES)', 480, doc.y + 5, { align: 'right', width: 80 });

    // Items Table Row
    const itemY = doc.y + 30;
    doc.fillColor('#000000').font(regular).text(`Subscription Service Fee (1 Month)`, 60, itemY);
    doc.text(plan.name, 300, itemY);
    doc.text(`KES ${payment.amount.toFixed(2)}`, 480, itemY, { align: 'right', width: 80 });
    
    // Total Summary
    doc.moveDown(6);
    doc.strokeColor(secondaryColor).lineWidth(0.5).moveTo(400, doc.y).lineTo(565, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(14).font(bold).text('TOTAL PAID:', 400, doc.y, { continued: true });
    doc.text(`KES ${payment.amount.toFixed(2)}`, 480, doc.y, { align: 'right', width: 80 });
    
    // Status Stamp
    doc.moveDown(2);
    doc.fontSize(16).fillColor('#008000').font(bold).text('STATUS: COMPLETED', 50, doc.y);
    doc.fontSize(10).fillColor('#666666').text(`Transaction Ref: ${payment.intasendInvoiceId}`, 50, doc.y + 20);

    doc.end();
  });
};

export { generateInvoicePDF };