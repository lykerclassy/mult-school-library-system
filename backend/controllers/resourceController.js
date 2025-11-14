// backend/controllers/resourceController.js

import asyncHandler from 'express-async-handler';
import Resource from '../models/Resource.js';
import { cloudinary } from '../config/cloudinary.js';

/**
 * @desc    Upload a new resource
 * @route   POST /api/v1/resources
 * @access  Private (SchoolStaff)
 */
const uploadResource = asyncHandler(async (req, res) => {
  // --- THIS IS THE FIX ---
  // We MUST check if the file upload middleware (multer) worked.
  // If it didn't, req.file will be missing.
  if (!req.file) {
    res.status(400);
    throw new Error(
      'File upload failed. This is likely due to an invalid CLOUDINARY_API_SECRET or other configuration issue.'
    );
  }
  // --- END OF FIX ---

  const { title, resourceType, subject, classLevel } = req.body;
  const { path, public_id, format } = req.file; // This will now be safe to read

  if (!title || !resourceType) {
    res.status(400);
    throw new Error('Title and Resource Type are required');
  }

  const resource = await Resource.create({
    title,
    resourceType,
    subject: subject || null,
    classLevel: classLevel || null,
    fileUrl: path,
    cloudinaryPublicId: public_id,
    fileType: format,
    school: req.user.school,
    uploadedBy: req.user._id,
  });

  res.status(201).json(resource);
});

/**
 * @desc    Get all resources for staff management
 * @route   GET /api/v1/resources
 * @access  Private (SchoolStaff)
 */
const getResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ school: req.user.school })
    .populate('subject', 'name')
    .populate('classLevel', 'name')
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(resources);
});

/**
 * @desc    Get all resources for students (filtered)
 * @route   GET /api/v1/resources/student
 * @access  Private (Student)
 */
const getStudentResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ school: req.user.school })
    .populate('subject', 'name')
    .populate('classLevel', 'name')
    .sort({ createdAt: -1 });
  
  res.status(200).json(resources);
});

/**
 * @desc    Delete a resource
 * @route   DELETE /api/v1/resources/:id
 * @access  Private (SchoolStaff)
 */
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource || resource.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Resource not found');
  }

  // 1. Delete from Cloudinary
  // We must tell Cloudinary it's a 'raw' file, not an image
  await cloudinary.uploader.destroy(resource.cloudinaryPublicId, {
    resource_type: "raw", 
  });

  // 2. Delete from database
  await resource.deleteOne();

  res.status(200).json({ message: 'Resource deleted successfully' });
});

export { uploadResource, getResources, getStudentResources, deleteResource };