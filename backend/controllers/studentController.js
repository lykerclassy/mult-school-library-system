// backend/controllers/studentController.js

import asyncHandler from 'express-async-handler';
import Student from '../models/Student.js';
import User from '../models/User.js';
import School from '../models/School.js';

// --- (addStudent function is unchanged) ---
const addStudent = asyncHandler(async (req, res) => {
  const { name, admissionNumber } = req.body;
  const schoolId = req.user.school;

  if (!name || !admissionNumber) {
    res.status(400);
    throw new Error('Please provide name and admission number');
  }

  if (admissionNumber.length < 6) {
    res.status(400);
    throw new Error(
      'Admission Number must be at least 6 characters long (it is used as the default password).'
    );
  }

  const school = await School.findById(schoolId);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }

  const studentExists = await Student.findOne({
    admissionNumber,
    school: schoolId,
  });

  if (studentExists) {
    res.status(400);
    throw new Error('Student with this admission number already exists');
  }

  const schoolNameHandle = school.name
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '');
    
  const studentEmail = `${admissionNumber}@${schoolNameHandle}.com`;
  const defaultPassword = admissionNumber;

  const userExists = await User.findOne({ email: studentEmail });
  if (userExists) {
    res.status(400);
    throw new Error(
      'A user account for this student admission number already exists.'
    );
  }

  const studentUser = new User({
    name,
    email: studentEmail,
    password: defaultPassword,
    role: 'Student',
    school: schoolId,
  });

  const student = new Student({
    name,
    admissionNumber,
    school: schoolId,
    userAccount: studentUser._id,
  });

  try {
    await studentUser.save();
    const createdStudent = await student.save();

    res.status(201).json(createdStudent);
  } catch (error) {
    await User.deleteOne({ _id: studentUser._id });
    await Student.deleteOne({ _id: student._id });
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      res.status(400);
      throw new Error(messages.join(', '));
    }
    
    res.status(400);
    throw new Error(`Failed to create student: ${error.message}`);
  }
});

// --- UPDATED FUNCTION ---
/**
 * @desc    Get all students for the school (paginated)
 * @route   GET /api/v1/students
 * @access  Private (SchoolStaff)
 */
const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  const query = {
    school: req.user.school,
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { admissionNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { name: 1 },
    populate: { path: 'userAccount', select: 'email' },
  };

  const paginatedResults = await Student.paginate(query, options);
  res.status(200).json(paginatedResults);
});
// --- END OF UPDATE ---


// --- (getStudentById, updateStudent, deleteStudent functions are unchanged) ---
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student || student.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Student not found');
  }
  res.status(200).json(student);
});

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
      const school = await School.findById(req.user.school);
      const schoolNameHandle = school.name
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '');
      user.email = `${admissionNumber}@${schoolNameHandle}.com`;
    }
    student.name = name || student.name;
    student.admissionNumber = admissionNumber || student.admissionNumber;
    user.name = name || user.name;
    await user.save();
  } else {
    student.name = name || student.name;
    student.admissionNumber = admissionNumber || student.admissionNumber;
  }

  const updatedStudent = await student.save();
  res.status(200).json(updatedStudent);
});

const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student || student.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Student not found');
  }
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