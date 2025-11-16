// backend/controllers/analyticsController.js

import asyncHandler from 'express-async-handler';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import Book from '../models/Book.js';
import Student from '../models/Student.js';
import Transaction from '../models/Transaction.js';
import School from '../models/School.js';
import User from '../models/User.js'; // <-- 1. IMPORT
import Plan from '../models/Plan.js'; // <-- 2. IMPORT

// --- (getDashboardAnalytics is unchanged) ---
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const schoolId = req.user.school;
  const totalBooks = await Book.countDocuments({ school: schoolId });
  const totalStudents = await Student.countDocuments({ school: schoolId });
  const totalIssued = await Transaction.countDocuments({
    school: schoolId,
    status: 'Issued',
  });
  const booksBySubject = await Book.aggregate([
    { $match: { school: schoolId } },
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subjectDetails' } },
    { $unwind: { path: '$subjectDetails', preserveNullAndEmptyArrays: true } },
    { $project: { name: { $ifNull: ['$subjectDetails.name', 'Uncategorized'] }, count: 1 } },
  ]);
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

// --- (generateAllBooksReport is unchanged) ---
const generateAllBooksReport = asyncHandler(async (req, res) => {
  // ... (Full PDFKit function from last time)
  const schoolId = req.user.school;
  const books = await Book.find({ school: schoolId }).populate('subject', 'name').populate('classLevel', 'name').sort({ title: 1 });
  const school = await School.findById(schoolId);
  const user = req.user;
  const qrImage = await QRCode.toDataURL(process.env.CLIENT_URL || 'https://default.url');
  const doc = new PDFDocument({ size: 'A4', margin: 30, layout: 'portrait' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=all_books_report.pdf');
  doc.pipe(res);
  doc.on('pageAdded', () => generateFooter(doc, user));
  generateHeader(doc, school, qrImage);
  const tableTop = 175;
  const rowHeight = 30;
  doc.fontSize(10).font('Helvetica-Bold');
  generateTableRow(doc, tableTop, 'Title', 'Author', 'Subject', 'Class', 'ISBN', 'Qty (Avail)');
  doc.strokeColor('#aaaaaa').lineWidth(0.5).moveTo(30, tableTop + 15).lineTo(565, tableTop + 15).stroke();
  doc.font('Helvetica');
  let currentY = tableTop + 25;
  for (const book of books) {
    if (currentY + rowHeight > doc.page.height - 70) {
      doc.addPage();
      generateHeader(doc, school, qrImage);
      doc.fontSize(10).font('Helvetica-Bold');
      generateTableRow(doc, tableTop, 'Title', 'Author', 'Subject', 'Class', 'ISBN', 'Qty (Avail)');
      doc.strokeColor('#aaaaaa').lineWidth(0.5).moveTo(30, tableTop + 15).lineTo(565, tableTop + 15).stroke();
      doc.font('Helvetica');
      currentY = tableTop + 25;
    }
    const qty = `${book.quantity} (${book.quantityAvailable})`;
    generateTableRow(doc, currentY, book.title, book.author, book.subject?.name || 'N/A', book.classLevel?.name || 'N/A', book.isbn || 'N/A', qty);
    doc.strokeColor('#e5e5e5').lineWidth(0.5).moveTo(30, currentY + rowHeight - 5).lineTo(565, currentY + rowHeight - 5).stroke();
    currentY += rowHeight;
  }
  generateFooter(doc, user);
  doc.end();
});

// --- NEW FUNCTION ---
/**
 * @desc    Get dashboard analytics for the Developer
 * @route   GET /api/v1/analytics/developer
 * @access  Private (Developer)
 */
const getDeveloperAnalytics = asyncHandler(async (req, res) => {
  const totalSchools = await School.countDocuments();
  const totalUsers = await User.countDocuments();
  
  // Calculate total monthly revenue
  const activeSchools = await School.find({ subscriptionStatus: 'Active' })
    .populate('plan');
    
  const totalRevenue = activeSchools.reduce((acc, school) => {
    return acc + (school.plan?.price || 0);
  }, 0);

  res.status(200).json({
    totalSchools,
    totalUsers,
    totalRevenue: totalRevenue / 100, // Convert from cents to KES
  });
});

// --- (Helper functions for PDF) ---
function generateHeader(doc, school, qrImage) {
  if (qrImage) { doc.image(qrImage, 30, 40, { width: 80 }); }
  doc.fillColor('#444444');
  doc.fontSize(20).font('Helvetica-Bold').text(school.name || 'School Report', 120, 45, { align: 'right' });
  doc.fontSize(10).font('Helvetica').text(school.address || '', 120, 70, { align: 'right' });
  doc.fontSize(10).text(school.motto || '', 120, 85, { align: 'right' });
  doc.fillColor('black');
  doc.fontSize(16).font('Helvetica-Bold').text('All Books Report', 30, 130, { align: 'center', width: 550 });
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(30, 155).lineTo(565, 155).stroke();
  doc.moveDown(2);
}
function generateFooter(doc, user) {
  const pageNumber = doc.page.number;
  doc.fontSize(8).font('Helvetica').text(`Page ${pageNumber} | Generated on: ${new Date().toLocaleDateString()} by ${user.name}`, 30, doc.page.height - 50, { align: 'center', width: 550 });
}
function generateTableRow(doc, y, c1, c2, c3, c4, c5, c6) {
  doc.fontSize(9).font('Helvetica');
  doc.text(c1, 30, y, { width: 140 });
  doc.text(c2, 170, y, { width: 90 });
  doc.text(c3, 260, y, { width: 80 });
  doc.text(c4, 340, y, { width: 80 });
  doc.text(c5, 420, y, { width: 90 });
  doc.text(c6, 510, y, { width: 55, align: 'right' });
}

export { 
  getDashboardAnalytics, 
  generateAllBooksReport,
  getDeveloperAnalytics // <-- 3. EXPORT
};