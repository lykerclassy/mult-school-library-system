import Student from '../models/Student.js';
import asyncHandler from 'express-async-handler';

// @desc    Add a new student
// @route   POST /api/students
// @access  Private (School Staff)
const addStudent = asyncHandler(async (req, res) => {
  const { name, studentId, class: studentClass, stream, dorm, parentPhone } =
    req.body;
  const schoolId = req.user.schoolId;

  // 1. Check if student ID is already used *at this school*
  const studentExists = await Student.findOne({ studentId, school: schoolId });
  if (studentExists) {
    res.status(400);
    throw new Error('Student with this ID already exists at your school');
  }

  // 2. Create the student
  const student = await Student.create({
    name,
    studentId,
    class: studentClass,
    stream,
    dorm,
    parentPhone,
    school: schoolId, // <-- MAGIC: Assigns to the staff's school
  });

  if (student) {
    res.status(201).json(student);
  } else {
    res.status(400);
    throw new Error('Invalid student data');
  }
});

// @desc    Get all students for the staff's school
// @route   GET /api/students
// @access  Private (School Staff)
const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({
    school: req.user.schoolId, // <-- MAGIC: Finds only for their school
  });
  res.json(students);
});

export { addStudent, getStudents };