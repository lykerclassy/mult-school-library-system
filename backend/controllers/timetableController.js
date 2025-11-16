// backend/controllers/timetableController.js

import asyncHandler from 'express-async-handler';
import Timetable from '../models/Timetable.js';
import Student from '../models/Student.js';

/**
 * @desc    Create a new timetable entry
 * @route   POST /api/v1/timetables
 * @access  Private (SchoolAdmin)
 */
const createTimetableEntry = asyncHandler(async (req, res) => {
  const { classLevel, subject, teacher, dayOfWeek, startTime, endTime } = req.body;

  if (!classLevel || !subject || !teacher || !dayOfWeek || !startTime || !endTime) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  // Check for conflicts
  const existingEntry = await Timetable.findOne({
    school: req.user.school,
    classLevel,
    dayOfWeek,
    startTime,
  });

  if (existingEntry) {
    res.status(400);
    throw new Error('A class is already scheduled for this class at this time.');
  }
  
  // TODO: We could also check if the *teacher* is free at this time

  const entry = await Timetable.create({
    school: req.user.school,
    classLevel,
    subject,
    teacher,
    dayOfWeek,
    startTime,
    endTime,
  });

  res.status(201).json(entry);
});

/**
 * @desc    Get timetable for a specific class
 * @route   GET /api/v1/timetables/class/:classId
 * @access  Private (SchoolStaff)
 */
const getTimetableForClass = asyncHandler(async (req, res) => {
  const entries = await Timetable.find({
    school: req.user.school,
    classLevel: req.params.classId,
  })
    .populate('subject', 'name')
    .populate('teacher', 'name')
    .sort({ startTime: 1 });
    
  res.status(200).json(entries);
});

/**
 * @desc    Get timetable for the logged-in student
 * @route   GET /api/v1/timetables/my-timetable
 * @access  Private (Student)
 */
const getMyTimetable = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userAccount: req.user._id });
  if (!student || !student.classLevel) {
    res.status(404);
    throw new Error('You are not assigned to a class.');
  }

  const entries = await Timetable.find({
    school: req.user.school,
    classLevel: student.classLevel,
  })
    .populate('subject', 'name')
    .populate('teacher', 'name')
    .sort({ startTime: 1 });

  res.status(200).json(entries);
});

/**
 * @desc    Delete a timetable entry
 * @route   DELETE /api/v1/timetables/:id
 * @access  Private (SchoolAdmin)
 */
const deleteTimetableEntry = asyncHandler(async (req, res) => {
  const entry = await Timetable.findById(req.params.id);

  if (!entry || entry.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Entry not found');
  }

  await entry.deleteOne();
  res.status(200).json({ message: 'Timetable entry deleted' });
});

export {
  createTimetableEntry,
  getTimetableForClass,
  getMyTimetable,
  deleteTimetableEntry,
};