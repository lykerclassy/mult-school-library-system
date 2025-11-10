import express from 'express';
const router = express.Router();
import {
  addLibrarian,
  getSchoolLibrarians,
} from '../controllers/userController.js';
import { protect, isSchoolAdmin } from '../middleware/authMiddleware.js';

// All routes are protected and for School Admins only
router.use(protect, isSchoolAdmin);

router.route('/add-librarian').post(addLibrarian);
router.route('/librarians').get(getSchoolLibrarians);

export default router;