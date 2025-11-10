import express from 'express';
const router = express.Router();
import { addStudent, getStudents } from '../controllers/studentController.js';
import { protect, isSchoolStaff } from '../middleware/authMiddleware.js';

// All routes are protected and for all school staff
router.use(protect, isSchoolStaff);

router.route('/').post(addStudent).get(getStudents);

export default router;