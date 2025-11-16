// backend/controllers/resourceController.js

import asyncHandler from 'express-async-handler';
import Resource from '../models/Resource.js';
import { cloudinary } from '../config/cloudinary.js';

// --- (uploadResource, getResources, deleteResource, uploadImageForEditor are unchanged) ---
const uploadResource = asyncHandler(async (req, res) => { /* ... (Staff upload) */ });
const getResources = asyncHandler(async (req, res) => { /* ... (Staff get) */ });
const deleteResource = asyncHandler(async (req, res) => { /* ... (Staff delete) */ });
const uploadImageForEditor = asyncHandler(async (req, res) => { /* ... (Staff image upload) */ });

// --- UPDATED FUNCTION ---
/**
 * @desc    Get all resources for students (filtered)
 * @route   GET /api/v1/resources/student
 * @access  Private (Student)
 */
const getStudentResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({
    $or: [
      { school: req.user.school }, // Their school's resources
      { school: null }            // Global resources
    ]
  })
    .populate('subject', 'name')
    .populate('classLevel', 'name')
    .sort({ createdAt: -1 });
  
  res.status(200).json(resources);
});

// --- NEW FUNCTION ---
/**
 * @desc    Upload a new GLOBAL resource
 * @route   POST /api/v1/resources/global
 * @access  Private (Developer)
 */
const createGlobalResource = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400); throw new Error('File upload failed.');
  }
  
  const { path, filename, mimetype, originalname } = req.file;
  const { title, resourceType } = req.body;

  if (!title || !resourceType) {
    res.status(400);
    throw new Error('Title and Resource Type are required');
  }

  const resource = await Resource.create({
    title,
    resourceType,
    fileUrl: path,
    cloudinaryPublicId: filename,
    fileType: mimetype,
    originalFilename: originalname,
    school: null, // <-- This makes it global
    uploadedBy: req.user._id,
  });

  res.status(201).json(resource);
});

// --- NEW FUNCTION ---
/**
 * @desc    Get all GLOBAL resources
 * @route   GET /api/v1/resources/global
 * @access  Private (Developer)
 */
const getGlobalResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ school: null })
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });
  
  res.status(200).json(resources);
});

export { 
  uploadResource, 
  getResources, 
  getStudentResources, 
  deleteResource,
  uploadImageForEditor,
  createGlobalResource, // <-- EXPORT
  getGlobalResources, // <-- EXPORT
};