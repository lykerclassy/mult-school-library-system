// backend/routes/resourceRoutes.js

import express from 'express';
const router = express.Router();
import {
  uploadResource,
  getResources,
  getStudentResources,
  deleteResource,
  uploadImageForEditor, // <-- IMPORT
} from '../controllers/resourceController.js';
import { protect, isSchoolStaff } from '../middleware/authMiddleware.js';
// --- IMPORT BOTH UPLOADERS ---
import { fileUpload, imageUpload } from '../middleware/uploadMiddleware.js';

// --- Student Route ---
router.route('/student').get(protect, getStudentResources);

// --- NEW Editor Image Upload Route (for staff) ---
router
  .route('/editor-image-upload')
  .post(protect, isSchoolStaff, imageUpload.single('file'), uploadImageForEditor);

// --- Staff Resource Routes ---
router
  .route('/')
  .post(protect, isSchoolStaff, fileUpload.single('file'), uploadResource)
  .get(protect, isSchoolStaff, getResources);

router
  .route('/:id')
  .delete(protect, isSchoolStaff, deleteResource);

export default router;