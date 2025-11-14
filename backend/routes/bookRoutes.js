// backend/routes/bookRoutes.js

import express from 'express';
const router = express.Router();
import {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import {
  protect,
  isSchoolAdmin,
  isSchoolStaff,
} from '../middleware/authMiddleware.js';

// All routes are protected and for school staff
router.use(protect, isSchoolStaff);

// GET /api/v1/books (Staff can view)
router.route('/').get(getBooks);

// POST /api/v1/books (Admin only)
router.route('/').post(isSchoolAdmin, addBook);

// Routes for a specific book ID
router
  .route('/:id')
  .get(getBookById) // Staff can view
  .put(isSchoolAdmin, updateBook) // Admin only
  .delete(isSchoolAdmin, deleteBook); // Admin only

export default router;