import Book from '../models/Book.js';
import asyncHandler from 'express-async-handler';

// @desc    Add a new book
// @route   POST /api/books
// @access  Private (School Staff)
const addBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, quantity } = req.body;
  const schoolId = req.user.schoolId;

  // 1. Create the book
  const book = await Book.create({
    title,
    author,
    isbn,
    quantity: Number(quantity),
    available: Number(quantity), // <-- Set available to total quantity
    school: schoolId, // <-- MAGIC: Assigns to the staff's school
  });

  if (book) {
    res.status(201).json(book);
  } else {
    res.status(400);
    throw new Error('Invalid book data');
  }
});

// @desc    Get all books for the staff's school
// @route   GET /api/books
// @access  Private (School Staff)
const getBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({
    school: req.user.schoolId, // <-- MAGIC: Finds only for their school
  });
  res.json(books);
});

export { addBook, getBooks };