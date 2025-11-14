// backend/controllers/studentController.js

import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import User from '../models/User.js';
import School from '../models/School.js';

/**
 * @desc    Add a new student
 * @route   POST /api/v1/students
 * @access  Private (SchoolAdmin)
 */
const addStudent = asyncHandler(async (req, res) => {
  const { name, admissionNumber } = req.body;
  const schoolId = req.user.school;

  if (!name || !admissionNumber) {
    res.status(400);
    throw new Error('Please provide name and admission number');
  }

  // Check password length
  if (admissionNumber.length < 6) {
    res.status(400);
    throw new Error(
      'Admission Number must be at least 6 characters long (it is used as the default password).'
    );
  }

  // Find the school to create a unique email
  const school = await School.findById(schoolId);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }

  // Check if student admission number already exists in this school
  const studentExists = await Student.findOne({
    admissionNumber,
    school: schoolId,
  });

  if (studentExists) {
    res.status(400);
    throw new Error('Student with this admission number already exists');
  }

  // Create the student's login email and default password
  const schoolNameHandle = school.name
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '');
    
  // --- THIS IS THE FIX ---
  // Changed '.school' to '.com' to pass the User model's email validation
  const studentEmail = `${admissionNumber}@${schoolNameHandle}.com`;
  // -----------------------

  const defaultPassword = admissionNumber;

  // Check if a user with this email already exists
  const userExists = await User.findOne({ email: studentEmail });
  if (userExists) {
    res.status(400);
    throw new Error(
      'A user account for this student admission number already exists.'
    );
  }

  // Create the User account
  const studentUser = new User({
    name,
    email: studentEmail,
    password: defaultPassword,
    role: 'Student',
    school: schoolId,
  });

  // Create the Student profile
  const student = new Student({
    name,
    admissionNumber,
    school: schoolId,
    userAccount: studentUser._id, // Link to the user account
  });

  // Save both
  try {
    await studentUser.save();
    const createdStudent = await student.save();

    res.status(201).json(createdStudent);
  } catch (error) {
    // If one fails, delete the other to avoid orphan data
    await User.deleteOne({ _id: studentUser._id });
    await Student.deleteOne({ _id: student._id });
    
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      res.status(400);
      throw new Error(messages.join(', '));
    }
    
    res.status(400);
    throw new Error(`Failed to create student: ${error.message}`);
  }
});

/**
 * @desc    Get all students for the school
 * @route   GET /api/v1/students
 * @access  Private (SchoolStaff)
 */
const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({ school: req.user.school })
    .populate('userAccount', 'email')
    .sort({
      name: 1,
    });
  res.status(200).json(students);
});

/**
 * @desc    Get student by ID
 * @route   GET /api/v1/students/:id
 * @access  Private (SchoolStaff)
 */
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student || student.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Student not found');
  }

  res.status(200).json(student);
});

/**
 * @desc    Update a student
 * @route   PUT /api/v1/students/:id
 * @access  Private (SchoolAdmin)
 */
const updateStudent = asyncHandler(async (req, res) => {
  const { name, admissionNumber } = req.body;

  const student = await Student.findById(req.params.id).populate('userAccount');

  if (!student || student.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Student not found');
  }

  if (student.userAccount) {
    const user = await User.findById(student.userAccount._id);
    if (!user) {
      res.status(404);
      throw new Error('Student user account not found. Please re-create student.');
    }

    // Check if new admission number conflicts
    if (admissionNumber && admissionNumber !== student.admissionNumber) {
      
      if (admissionNumber.length < 6) {
        res.status(400);
        throw new Error(
          'Admission Number must be at least 6 characters long (it is used as the default password).'
        );
      }

      const studentExists = await Student.findOne({
        admissionNumber,
        school: req.user.school,
        _id: { $ne: req.params.id },
      });
      if (studentExists) {
        res.status(400);
        throw new Error('Another student with this admission number already exists');
      }

      // Update user account email as well
      const school = await School.findById(req.user.school);
      
      const schoolNameHandle = school.name
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '');
        
      // --- THIS IS THE FIX ---
      user.email = `${admissionNumber}@${schoolNameHandle}.com`;
      // -----------------------
    }

    student.name = name || student.name;
    student.admissionNumber = admissionNumber || student.admissionNumber;
    user.name = name || user.name;
    // Note: We don't update the password here

    await user.save();
  } else {
    // Fallback if user account somehow doesn't exist
    student.name = name || student.name;
    student.admissionNumber = admissionNumber || student.admissionNumber;
  }

  const updatedStudent = await student.save();
  res.status(200).json(updatedStudent);
});

/**
 * @desc    Delete a student
 * @route   DELETE /api/v1/students/:id
 * @access  Private (SchoolAdmin)
 */
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (
    !student ||
    student.school.toString() !== req.user.school.toString()
  ) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Also delete the associated user account
  if (student.userAccount) {
    await User.deleteOne({ _id: student.userAccount });
  }

  await student.deleteOne();
  res.status(200).json({ message: 'Student removed successfully' });
});

export {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};