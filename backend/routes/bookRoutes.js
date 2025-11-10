import express from 'express';
const router = express.Router();
import { addBook, getBooks } from '../controllers/bookController.js';
import { protect, isSchoolStaff } from '../middleware/authMiddleware.js';

// All routes are protected and for all school staff
router.use(protect, isSchoolStaff);

router.route('/').post(addBook).get(getBooks);

export default router;