// backend/routes/resourceRoutes.js

import express from 'express';
const router = express.Router();
import {
  uploadResource,
  getResources,
  getStudentResources,
  deleteResource,
} from '../controllers/resourceController.js';
import { protect, isSchoolStaff } from '../middleware/authMiddleware.js';
import { fileUpload } from '../middleware/uploadMiddleware.js'; // Use the file uploader

// --- Student Route ---
// (Must be defined *before* the '/:id' route)
router.route('/student').get(protect, getStudentResources);

// --- Staff Routes ---
router
  .route('/')
  .post(protect, isSchoolStaff, fileUpload.single('file'), uploadResource)
  .get(protect, isSchoolStaff, getResources);

router
  .route('/:id')
  .delete(protect, isSchoolStaff, deleteResource);

export default router;