import express from 'express';
import { issueBook, returnBook, getMyBorrows } from '../controllers/borrowController.js';
import { protect, isSchoolStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', isSchoolStaff, issueBook);
router.put('/:id/return', isSchoolStaff, returnBook);
router.get('/my', getMyBorrows);

export default router;