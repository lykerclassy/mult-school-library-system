// backend/controllers/schoolController.js

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import School from '../models/School.js';
import Book from '../models/Book.js';
import Student from '../models/Student.js';

// @desc    Register a new school
// @route   POST /api/v1/schools/register
// @access  Private (Developer only)
const registerSchool = asyncHandler(async (req, res) => {
  const { schoolName, schoolAddress, adminName, adminEmail, adminPassword } =
    req.body;

  const schoolExists = await School.findOne({ name: schoolName });
  if (schoolExists) {
    res.status(400);
    throw new Error('A school with this name already exists');
  }

  const adminExists = await User.findOne({ email: adminEmail });
  if (adminExists) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const adminUser = new User({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'SchoolAdmin',
  });

  const school = new School({
    name: schoolName,
    address: schoolAddress,
    admin: adminUser._id,
  });

  adminUser.school = school._id;

  try {
    const savedAdmin = await adminUser.save();
    const savedSchool = await school.save();

    res.status(201).json({
      message: 'School registered successfully',
      school: savedSchool,
      admin: {
        _id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email,
        role: savedAdmin.role,
      },
    });
  } catch (error) {
    await User.deleteOne({ _id: adminUser._id });
    await School.deleteOne({ _id: school._id });
    res.status(400);
    throw new Error(`Failed to register school: ${error.message}`);
  }
});

// @desc    Get all schools (for Developer Portal)
// @route   GET /api/v1/schools
// @access  Private (Developer only)
const getAllSchools = asyncHandler(async (req, res) => {
  const schools = await School.find({}).populate('admin', 'name email');
  res.status(200).json(schools);
});

// @desc    Get dashboard stats for a School Admin
// @route   GET /api/v1/schools/stats
// @access  Private (SchoolAdmin only)
const getSchoolDashboardStats = asyncHandler(async (req, res) => {
  const schoolId = req.user.school;

  const totalStudents = await Student.countDocuments({ school: schoolId });
  const totalBooks = await Book.countDocuments({ school: schoolId });
  const borrowedBooks = 0; // Placeholder
  const totalStaff = await User.countDocuments({
    school: schoolId,
    role: { $in: ['SchoolAdmin', 'Librarian'] },
  });

  res.status(200).json({
    totalStudents,
    totalBooks,
    borrowedBooks,
    totalStaff,
  });
});

// @desc    Get school profile for the logged-in admin
// @route   GET /api/v1/schools/profile
// @access  Private (SchoolAdmin or SchoolStaff)
const getSchoolProfile = asyncHandler(async (req, res) => {
  const school = await School.findById(req.user.school);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }
  res.status(200).json(school);
});

// @desc    Update school profile
// @route   PUT /api/v1/schools/profile
// @access  Private (SchoolAdmin only)
const updateSchoolProfile = asyncHandler(async (req, res) => {
  // --- ADD THIS DEBUGGING LOG ---
  console.log(
    '--- updateSchoolProfile CONTROLLER REACHED! Multer is working. ---'
  );
  // ---------------------------------

  const school = await School.findById(req.user.school);

  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }

  school.name = req.body.name || school.name;
  school.address = req.body.address || school.address;
  school.motto = req.body.motto || school.motto;

  if (req.file) {
    console.log('File detected by controller:', req.file); // More logging
    school.logo = req.file.path;
  }

  const updatedSchool = await school.save();
  res.status(200).json(updatedSchool);
});

// --- EXPORT BLOCK ---
export {
  registerSchool,
  getAllSchools,
  getSchoolDashboardStats,
  getSchoolProfile,
  updateSchoolProfile,
};