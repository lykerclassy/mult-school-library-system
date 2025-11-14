// backend/controllers/bookController.js

import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';

/**
 * @desc    Add a new book
 * @route   POST /api/v1/books
 * @access  Private (SchoolAdmin)
 */
const addBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, quantity } = req.body;
  const schoolId = req.user.school;

  if (!title || !author || !quantity) {
    res.status(400);
    throw new Error('Please provide title, author, and quantity');
  }

  // Check if book with this ISBN already exists in this school
  if (isbn) {
    const bookExists = await Book.findOne({ isbn, school: schoolId });
    if (bookExists) {
      res.status(400);
      throw new Error('Book with this ISBN already exists');
    }
  }

  const book = new Book({
    title,
    author,
    isbn,
    quantity,
    school: schoolId,
    // quantityAvailable is set by 'pre-save' hook in model
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

/**
 * @desc    Get all books for the school
 * @route   GET /api/v1/books
 * @access  Private (SchoolStaff)
 */
const getBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({ school: req.user.school }).sort({
    title: 1,
  });
  res.status(200).json(books);
});

/**
 * @desc    Get book by ID
 * @route   GET /api/v1/books/:id
 * @access  Private (SchoolStaff)
 */
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book || book.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Book not found');
  }

  res.status(200).json(book);
});

/**
 * @desc    Update a book
 * @route   PUT /api/v1/books/:id
 * @access  Private (SchoolAdmin)
 */
const updateBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, quantity } = req.body;

  const book = await Book.findById(req.params.id);

  if (!book || book.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Check for ISBN conflict
  if (isbn && isbn !== book.isbn) {
    const bookExists = await Book.findOne({
      isbn,
      school: req.user.school,
      _id: { $ne: req.params.id },
    });
    if (bookExists) {
      res.status(400);
      throw new Error('Another book with this ISBN already exists');
    }
  }

  book.title = title || book.title;
  book.author = author || book.author;
  book.isbn = isbn || book.isbn;

  // Recalculate available quantity if total quantity is changed
  if (quantity) {
    const changeInQuantity = quantity - book.quantity;
    book.quantity = quantity;
    book.quantityAvailable = book.quantityAvailable + changeInQuantity;
    // Ensure available doesn't go below zero
    if (book.quantityAvailable < 0) {
      book.quantityAvailable = 0;
    }
  }

  const updatedBook = await book.save();
  res.status(200).json(updatedBook);
});

/**
 * @desc    Delete a book
 * @route   DELETE /api/v1/books/:id
 * @access  Private (SchoolAdmin)
 */
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book || book.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Book not found');
  }

  // TODO: Check if book is currently borrowed
  // For now, we'll delete directly

  await book.deleteOne();
  res.status(200).json({ message: 'Book removed successfully' });
});

export { addBook, getBooks, getBookById, updateBook, deleteBook };