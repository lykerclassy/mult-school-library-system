// backend/controllers/resourceController.js

import asyncHandler from 'express-async-handler';
import Resource from '../models/Resource.js';
import { cloudinary } from '../config/cloudinary.js';

// --- (uploadResource, getResources, getStudentResources, deleteResource are unchanged) ---
const uploadResource = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error(
      'File upload failed. This is likely due to an invalid CLOUDINARY_API_SECRET or other configuration issue.'
    );
  }
  const { path, filename, mimetype, originalname } = req.file;
  const { title, resourceType, subject, classLevel } = req.body;
  if (!title || !resourceType) {
    res.status(400);
    throw new Error('Title and Resource Type are required');
  }
  const resource = await Resource.create({
    title, resourceType,
    subject: subject || null,
    classLevel: classLevel || null,
    fileUrl: path,
    cloudinaryPublicId: filename,
    fileType: mimetype,
    originalFilename: originalname,
    school: req.user.school,
    uploadedBy: req.user._id,
  });
  res.status(201).json(resource);
});

const getResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ school: req.user.school })
    .populate('subject', 'name')
    .populate('classLevel', 'name')
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });
  res.status(200).json(resources);
});

const getStudentResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ school: req.user.school })
    .populate('subject', 'name')
    .populate('classLevel', 'name')
    .sort({ createdAt: -1 });
  res.status(200).json(resources);
});

const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource || resource.school.toString() !== req.user.school.toString()) {
    res.status(404); throw new Error('Resource not found');
  }
  await cloudinary.uploader.destroy(resource.cloudinaryPublicId, {
    resource_type: "raw", 
  });
  await resource.deleteOne();
  res.status(200).json({ message: 'Resource deleted successfully' });
});


// --- NEW FUNCTION ---
/**
 * @desc    Upload an image for the rich text editor
 * @route   POST /api/v1/resources/editor-image-upload
 * @access  Private (SchoolStaff)
 */
const uploadImageForEditor = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Image upload failed');
  }

  // SunEditor expects a specific JSON response format
  res.status(200).json({
    result: [
      {
        url: req.file.path,
        name: req.file.originalname,
        size: req.file.size,
      },
    ],
  });
});


export { 
  uploadResource, 
  getResources, 
  getStudentResources, 
  deleteResource,
  uploadImageForEditor // <-- EXPORT
};