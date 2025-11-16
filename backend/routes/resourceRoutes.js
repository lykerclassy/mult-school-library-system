// backend/routes/resourceRoutes.js

import express from 'express';
const router = express.Router();
import {
  uploadResource,
  getResources,
  getStudentResources,
  deleteResource,
  uploadImageForEditor,
  createGlobalResource, // <-- IMPORT
  getGlobalResources,   // <-- IMPORT
} from '../controllers/resourceController.js';
import { protect, isSchoolStaff, isDeveloper } from '../middleware/authMiddleware.js'; // <-- IMPORT
import { fileUpload, imageUpload } from '../middleware/uploadMiddleware.js';

// --- Developer Routes ---
router.route('/global')
  .post(protect, isDeveloper, fileUpload.single('file'), createGlobalResource)
  .get(protect, isDeveloper, getGlobalResources);

// --- Student Route ---
router.route('/student').get(protect, getStudentResources);

// --- Staff Image Upload Route ---
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