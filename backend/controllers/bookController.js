// backend/controllers/bookController.js

import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';

/**
 * @desc    Add a new book
 * @route   POST /api/v1/books
 * @access  Private (SchoolAdmin)
 */
const addBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, quantity, subject, classLevel } = req.body;
  const schoolId = req.user.school;

  if (!title || !author || !quantity) {
    res.status(400);
    throw new Error('Please provide title, author, and quantity');
  }

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
    subject: subject || null,
    classLevel: classLevel || null,
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

// --- UPDATED FUNCTION ---
/**
 * @desc    Get all books for the school (paginated)
 * @route   GET /api/v1/books
 * @access  Private (SchoolStaff)
 */
const getBooks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  // Build the query
  const query = {
    school: req.user.school,
  };

  // Add search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } },
    ];
  }

  // Set pagination options
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { title: 1 },
    populate: ['subject', 'classLevel'],
  };

  const paginatedResults = await Book.paginate(query, options);
  res.status(200).json(paginatedResults);
});
// --- END OF UPDATE ---

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
  const { title, author, isbn, quantity, subject, classLevel } = req.body;

  const book = await Book.findById(req.params.id);

  if (!book || book.school.toString() !== req.user.school.toString()) {
    res.status(4404);
    throw new Error('Book not found');
  }

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
  book.subject = subject || book.subject;
  book.classLevel = classLevel || book.classLevel;

  if (quantity) {
    const changeInQuantity = quantity - book.quantity;
    book.quantity = quantity;
    book.quantityAvailable = book.quantityAvailable + changeInQuantity;
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

  await book.deleteOne();
  res.status(200).json({ message: 'Book removed successfully' });
});

export { addBook, getBooks, getBookById, updateBook, deleteBook };