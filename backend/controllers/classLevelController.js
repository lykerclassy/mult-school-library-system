// backend/controllers/classLevelController.js

import asyncHandler from 'express-async-handler';
import ClassLevel from '../models/ClassLevel.js';

/**
 * @desc    Create a new class level
 * @route   POST /api/v1/classes
 * @access  Private (SchoolAdmin)
 */
const createClassLevel = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const schoolId = req.user.school;

  if (!name) {
    res.status(400);
    throw new Error('Class name is required');
  }

  const classExists = await ClassLevel.findOne({ name, school: schoolId });
  if (classExists) {
    res.status(400);
    throw new Error('This class level already exists');
  }

  const classLevel = await ClassLevel.create({
    name,
    school: schoolId,
  });

  res.status(201).json(classLevel);
});

/**
 * @desc    Get all class levels for the school
 * @route   GET /api/v1/classes
 * @access  Private (All school members)
 */
const getClassLevels = asyncHandler(async (req, res) => {
  const classes = await ClassLevel.find({ school: req.user.school }).sort({ name: 1 });
  res.status(200).json(classes);
});

// --- NEW FUNCTION ---
/**
 * @desc    Get a single class level by ID
 * @route   GET /api/v1/classes/:id
 * @access  Private (SchoolStaff)
 */
const getClassLevelById = asyncHandler(async (req, res) => {
  const classLevel = await ClassLevel.findById(req.params.id);

  if (!classLevel || classLevel.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Class not found');
  }

  res.status(200).json(classLevel);
});


export { createClassLevel, getClassLevels, getClassLevelById };