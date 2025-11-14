// backend/controllers/analyticsController.js

import asyncHandler from 'express-async-handler';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode'; // <-- IMPORT QRCODE
import Book from '../models/Book.js';
import Student from '../models/Student.js';
import Transaction from '../models/Transaction.js';
import School from '../models/School.js'; // <-- IMPORT SCHOOL

// --- (getDashboardAnalytics function is unchanged) ---
/**
 * @desc    Get dashboard analytics
 * @route   GET /api/v1/analytics/dashboard
 * @access  Private (SchoolStaff)
 */
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const schoolId = req.user.school;

  // 1. Core Stats
  const totalBooks = await Book.countDocuments({ school: schoolId });
  const totalStudents = await Student.countDocuments({ school: schoolId });
  const totalIssued = await Transaction.countDocuments({
    school: schoolId,
    status: 'Issued',
  });

  // 2. Books by Subject
  const booksBySubject = await Book.aggregate([
    { $match: { school: schoolId } },
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subjectDetails',
      },
    },
    { $unwind: { path: '$subjectDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: { $ifNull: ['$subjectDetails.name', 'Uncategorized'] },
        count: 1,
      },
    },
  ]);

  // 3. Recent Transactions
  const recentTransactions = await Transaction.find({ school: schoolId })
    .sort({ issueDate: -1 })
    .limit(5)
    .populate('student', 'name')
    .populate('book', 'title');

  res.status(200).json({
    coreStats: {
      totalBooks,
      totalStudents,
      totalIssued,
    },
    booksBySubject,
    recentTransactions,
  });
});

// --- NEW HELPER FUNCTIONS FOR PDF ---

// Generates the header on every page
function generateHeader(doc, school, qrImage) {
  // Add QR Code
  if (qrImage) {
    doc.image(qrImage, 30, 40, { width: 80 });
  }

  // School Details
  doc.fillColor('#444444');
  doc.fontSize(20).font('Helvetica-Bold').text(school.name || 'School Report', 120, 45, { align: 'right' });
  doc.fontSize(10).font('Helvetica').text(school.address || '', 120, 70, { align: 'right' });
  doc.fontSize(10).text(school.motto || '', 120, 85, { align: 'right' });
  doc.fillColor('black'); // Reset color

  // Report Title
  doc.fontSize(16).font('Helvetica-Bold').text('All Books Report', 30, 130, { align: 'center', width: 550 });
  
  // Line separator
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(30, 155).lineTo(565, 155).stroke();
  doc.moveDown(2);
}

// Generates the footer on every page
function generateFooter(doc, user) {
  const pageNumber = doc.page.number;
  doc
    .fontSize(8)
    .font('Helvetica')
    .text(
      `Page ${pageNumber} | Generated on: ${new Date().toLocaleDateString()} by ${user.name}`,
      30, // left margin
      doc.page.height - 50, // bottom margin
      { align: 'center', width: 550 }
    );
}

// Generates a single table row
function generateTableRow(doc, y, c1, c2, c3, c4, c5, c6) {
  doc.fontSize(9).font('Helvetica');
  doc.text(c1, 30, y, { width: 140 }); // Title
  doc.text(c2, 170, y, { width: 90 }); // Author
  doc.text(c3, 260, y, { width: 80 }); // Subject
  doc.text(c4, 340, y, { width: 80 }); // Class
  doc.text(c5, 420, y, { width: 90 }); // ISBN
  doc.text(c6, 510, y, { width: 55, align: 'right' }); // Qty
}

// --- UPDATED PDF REPORT FUNCTION ---

/**
 * @desc    Generate a PDF report of all books
 * @route   GET /api/v1/analytics/reports/all-books
 * @access  Private (SchoolStaff)
 */
const generateAllBooksReport = asyncHandler(async (req, res) => {
  const schoolId = req.user.school;
  
  // 1. Fetch all data
  const books = await Book.find({ school: schoolId })
    .populate('subject', 'name')
    .populate('classLevel', 'name')
    .sort({ title: 1 });
  
  const school = await School.findById(schoolId);
  const user = req.user;
  const qrImage = await QRCode.toDataURL(process.env.CLIENT_URL || 'https://default.url');

  // 2. Create PDF Document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 30,
    layout: 'portrait',
  });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=all_books_report.pdf');
  doc.pipe(res);

  // 3. Register page footer
  doc.on('pageAdded', () => generateFooter(doc, user));
  
  // 4. Draw Header
  generateHeader(doc, school, qrImage);

  // 5. Draw Table
  const tableTop = 175; // Starting Y for the table
  const rowHeight = 30; // Estimated row height

  // Draw Table Header
  doc.fontSize(10).font('Helvetica-Bold');
  generateTableRow(doc, tableTop, 'Title', 'Author', 'Subject', 'Class', 'ISBN', 'Qty (Avail)');
  doc.strokeColor('#aaaaaa').lineWidth(0.5).moveTo(30, tableTop + 15).lineTo(565, tableTop + 15).stroke();
  doc.font('Helvetica');

  let currentY = tableTop + 25;

  for (const book of books) {
    // Check if we need a new page
    // This is the fix for content being cut off
    if (currentY + rowHeight > doc.page.height - 70) { // 70 = footer margin
      doc.addPage();
      generateHeader(doc, school, qrImage); // Redraw header on new page
      
      // Redraw table header
      doc.fontSize(10).font('Helvetica-Bold');
      generateTableRow(doc, tableTop, 'Title', 'Author', 'Subject', 'Class', 'ISBN', 'Qty (Avail)');
      doc.strokeColor('#aaaaaa').lineWidth(0.5).moveTo(30, tableTop + 15).lineTo(565, tableTop + 15).stroke();
      doc.font('Helvetica');
      
      currentY = tableTop + 25; // Reset Y position
    }

    // Draw row content
    const qty = `${book.quantity} (${book.quantityAvailable})`;
    generateTableRow(
      doc,
      currentY,
      book.title,
      book.author,
      book.subject?.name || 'N/A',
      book.classLevel?.name || 'N/A',
      book.isbn || 'N/A',
      qty
    );
    
    // Draw row line
    doc.strokeColor('#e5e5e5').lineWidth(0.5).moveTo(30, currentY + rowHeight - 5).lineTo(565, currentY + rowHeight - 5).stroke();

    currentY += rowHeight;
  }
  
  // 6. Draw Footer (for the last page)
  generateFooter(doc, user);
  
  // 7. Finalize
  doc.end();
});

export { getDashboardAnalytics, generateAllBooksReport };