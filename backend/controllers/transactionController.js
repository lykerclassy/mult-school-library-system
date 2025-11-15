// backend/controllers/transactionController.js

import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.js';
import Book from '../models/Book.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';

// --- (Fine calculation logic is unchanged) ---
const FINE_PER_DAY = 10;
const calculateFine = (dueDate) => {
  const today = new Date();
  dueDate = new Date(dueDate);
  if (today <= dueDate) return 0;
  const diffTime = Math.abs(today.getTime() - dueDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays * FINE_PER_DAY;
};

// --- (issueBook function is unchanged) ---
const issueBook = asyncHandler(async (req, res) => {
  const { studentAdmissionNumber, bookISBN, daysToReturn } = req.body;
  const schoolId = req.user.school;
  if (!studentAdmissionNumber || !bookISBN || !daysToReturn) {
    res.status(400);
    throw new Error('Please provide Admission Number, Book ISBN, and Days duration');
  }
  const student = await Student.findOne({
    admissionNumber: studentAdmissionNumber,
    school: schoolId,
  }).populate('userAccount');
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  const book = await Book.findOne({
    isbn: bookISBN,
    school: schoolId,
  });
  if (!book) {
    res.status(404);
    throw new Error('Book not found with this ISBN');
  }
  if (book.quantityAvailable < 1) {
    res.status(400);
    throw new Error('Book is out of stock');
  }
  const activeTransaction = await Transaction.findOne({
    student: student._id,
    book: book._id,
    status: 'Issued',
  });
  if (activeTransaction) {
    res.status(400);
    throw new Error('Student already has a copy of this book');
  }
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(daysToReturn));
  const transaction = new Transaction({
    student: student._id,
    book: book._id,
    school: schoolId,
    dueDate: dueDate,
    issuedBy: req.user._id,
    status: 'Issued',
  });
  book.quantityAvailable -= 1;
  if (student.userAccount) {
    await Notification.create({
      user: student.userAccount._id,
      school: schoolId,
      message: `You have borrowed "${book.title}". It is due on ${dueDate.toLocaleDateString()}.`,
      link: '/my-books',
    });
  }
  await book.save();
  const createdTransaction = await transaction.save();
  res.status(201).json(createdTransaction);
});

// --- (returnBook function is unchanged) ---
const returnBook = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('book')
    .populate({
      path: 'student',
      populate: {
        path: 'userAccount',
        model: 'User'
      }
    });
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  if (transaction.school.toString() !== req.user.school.toString()) {
    res.status(403);
    throw new Error('Not authorized to perform this action');
  }
  if (transaction.status === 'Returned') {
    res.status(400);
    throw new Error('Book is already returned');
  }
  const fineAmount = calculateFine(transaction.dueDate);
  transaction.returnDate = Date.now();
  transaction.status = 'Returned';
  transaction.fine = fineAmount;
  transaction.fineStatus = fineAmount > 0 ? 'Unpaid' : 'Paid';
  const book = await Book.findById(transaction.book._id);
  if (book) {
    book.quantityAvailable += 1;
    await book.save();
  }
  let notifMessage = `Your return of "${transaction.book.title}" has been processed.`;
  if (fineAmount > 0) {
    notifMessage += ` A fine of ${fineAmount} KES has been issued for returning it late.`;
  }
  if (transaction.student.userAccount) {
    await Notification.create({
      user: transaction.student.userAccount._id,
      school: req.user.school,
      message: notifMessage,
      link: '/my-books',
    });
  }
  await transaction.save();
  res.status(200).json(transaction);
});


// --- UPDATED FUNCTION ---
/**
 * @desc    Get all active transactions (for staff)
 * @route   GET /api/v1/transactions
 * @access  Private (Librarian/Admin)
 */
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    school: req.user.school,
  })
    .populate('student', 'name admissionNumber')
    .populate('book', 'title isbn')
    // --- Sort by status to show Overdue first, then Issued, then Returned ---
    .sort({ status: 1, createdAt: -1 });
    
  res.status(200).json(transactions);
});

// --- (getMyTransactions function is unchanged) ---
const getMyTransactions = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userAccount: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found.');
  }
  const transactions = await Transaction.find({ student: student._id })
    .populate('book', 'title author isbn')
    .sort({ createdAt: -1 });
  res.status(200).json(transactions);
});

// --- (payFine function is unchanged) ---
const payFine = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction || transaction.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  if (transaction.fineStatus === 'Paid') {
    res.status(400);
    throw new Error('This fine has already been paid');
  }
  transaction.fineStatus = 'Paid';
  await transaction.save();
  res.status(200).json({ message: 'Fine marked as paid' });
});

export { issueBook, returnBook, getTransactions, getMyTransactions, payFine };