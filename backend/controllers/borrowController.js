import asyncHandler from 'express-async-handler';
import Borrow from '../models/Borrow.js';
import Book from '../models/Book.js';

// @desc    Issue a book
// @route   POST /api/borrow
// @access  Private (Librarian)
const issueBook = asyncHandler(async (req, res) => {
  const { studentId, bookId, dueDate } = req.body;
  const school = req.user.school;

  const book = await Book.findOne({ _id: bookId, school });
  if (!book || book.availableCopies === 0) {
    res.status(400);
    throw new Error('Book not available');
  }

  const existing = await Borrow.findOne({
    student: studentId,
    book: bookId,
    status: 'active',
  });
  if (existing) {
    res.status(400);
    throw new Error('Student already has this book');
  }

  const borrow = await Borrow.create({
    student: studentId,
    book: bookId,
    issuedBy: req.user._id,
    dueDate,
    school,
  });

  book.availableCopies -= 1;
  book.status = book.availableCopies > 0 ? 'available' : 'borrowed';
  await book.save();

  res.status(201).json(borrow.populate('student book'));
});

// @desc    Return a book
// @route   PUT /api/borrow/:id/return
// @access  Private (Librarian)
const returnBook = asyncHandler(async (req, res) => {
  const borrow = await Borrow.findById(req.params.id);
  if (!borrow || borrow.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Borrow record not found');
  }

  if (borrow.returnDate) {
    res.status(400);
    throw new Error('Book already returned');
  }

  borrow.returnDate = new Date();
  await borrow.save();

  const book = await Book.findById(borrow.book);
  book.availableCopies += 1;
  book.status = 'available';
  await book.save();

  res.json({ message: 'Book returned' });
});

// @desc    Get student's borrowed books
// @route   GET /api/borrow/my
// @access  Private (Student)
const getMyBorrows = asyncHandler(async (req, res) => {
  const borrows = await Borrow.find({
    student: req.user._id,
    school: req.user.school,
  })
    .populate('book', 'title author coverImage')
    .sort({ issueDate: -1 });

  res.json(borrows);
});

export { issueBook, returnBook, getMyBorrows };