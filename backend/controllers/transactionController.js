// backend/controllers/transactionController.js

import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.js';
import Book from '../models/Book.js';
import Student from '../models/Student.js';

/**
 * @desc    Issue a book to a student
 * @route   POST /api/v1/transactions/issue
 * @access  Private (Librarian/Admin)
 */
const issueBook = asyncHandler(async (req, res) => {
  const { studentAdmissionNumber, bookISBN, daysToReturn } = req.body;
  const schoolId = req.user.school;

  // 1. Validate Input
  if (!studentAdmissionNumber || !bookISBN || !daysToReturn) {
    res.status(400);
    throw new Error('Please provide Admission Number, Book ISBN, and Days duration');
  }

  // 2. Find Student
  const student = await Student.findOne({
    admissionNumber: studentAdmissionNumber,
    school: schoolId,
  });
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // 3. Find Book
  const book = await Book.findOne({
    isbn: bookISBN,
    school: schoolId,
  });
  if (!book) {
    res.status(404);
    throw new Error('Book not found with this ISBN');
  }

  // 4. Check Stock
  if (book.quantityAvailable < 1) {
    res.status(400);
    throw new Error('Book is out of stock');
  }

  // 5. Check if student already has this book issued (and not returned)
  const activeTransaction = await Transaction.findOne({
    student: student._id,
    book: book._id,
    status: 'Issued',
  });
  if (activeTransaction) {
    res.status(400);
    throw new Error('Student already has a copy of this book');
  }

  // 6. Calculate Due Date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(daysToReturn));

  // 7. Create Transaction
  const transaction = new Transaction({
    student: student._id,
    book: book._id,
    school: schoolId,
    dueDate: dueDate,
    issuedBy: req.user._id,
    status: 'Issued',
  });

  // 8. Update Book Stock (Decrement)
  book.quantityAvailable -= 1;

  // Save both
  await book.save();
  const createdTransaction = await transaction.save();

  res.status(201).json(createdTransaction);
});

/**
 * @desc    Return a book
 * @route   POST /api/v1/transactions/:id/return
 * @access  Private (Librarian/Admin)
 */
const returnBook = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('book');

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  
  // Security check: Only staff from the same school can return
  if (transaction.school.toString() !== req.user.school.toString()) {
    res.status(403);
    throw new Error('Not authorized to perform this action');
  }

  if (transaction.status === 'Returned') {
    res.status(400);
    throw new Error('Book is already returned');
  }

  // 1. Update Transaction
  transaction.returnDate = Date.now();
  transaction.status = 'Returned';

  // 2. Update Book Stock (Increment)
  const book = await Book.findById(transaction.book._id);
  if (book) {
    book.quantityAvailable += 1;
    await book.save();
  }

  await transaction.save();
  res.status(200).json({ message: 'Book returned successfully' });
});

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
    .sort({ status: 1, createdAt: -1 });

  res.status(200).json(transactions);
});

// --- NEW FUNCTION ---
/**
 * @desc    Get all transactions for the logged-in student
 * @route   GET /api/v1/transactions/my-history
 * @access  Private (Student)
 */
const getMyTransactions = asyncHandler(async (req, res) => {
  // 1. Find the student profile linked to the logged-in user
  const student = await Student.findOne({ userAccount: req.user._id });

  if (!student) {
    res.status(404);
    throw new Error('Student profile not found.');
  }

  // 2. Find all transactions for this student
  const transactions = await Transaction.find({ student: student._id })
    .populate('book', 'title author isbn')
    .sort({ createdAt: -1 });

  res.status(200).json(transactions);
});
// --- END NEW FUNCTION ---


export { issueBook, returnBook, getTransactions, getMyTransactions };