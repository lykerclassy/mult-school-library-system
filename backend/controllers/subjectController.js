// backend/controllers/subjectController.js

import asyncHandler from 'express-async-handler';
import Subject from '../models/Subject.js';

/**
 * @desc    Create a new subject
 * @route   POST /api/v1/subjects
 * @access  Private (SchoolAdmin)
 */
const createSubject = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const schoolId = req.user.school;

  if (!name) {
    res.status(400);
    throw new Error('Subject name is required');
  }

  const subjectExists = await Subject.findOne({ name, school: schoolId });
  if (subjectExists) {
    res.status(400);
    throw new Error('This subject already exists');
  }

  const subject = await Subject.create({
    name,
    school: schoolId,
  });

  res.status(201).json(subject);
});

/**
 * @desc    Get all subjects for the school
 * @route   GET /api/v1/subjects
 * @access  Private (SchoolStaff)
 */
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({ school: req.user.school }).sort({ name: 1 });
  res.status(200).json(subjects);
});

// We can add delete/update functions later if needed

export { createSubject, getSubjects };