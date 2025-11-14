// backend/controllers/schoolController.js

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import School from '../models/School.js';
import Book from '../models/Book.js';
import Student from '../models/Student.js';
import { cloudinary } from '../config/cloudinary.js'; // ← Add this import

// @desc    Register a new school
// @route   POST /api/v1/schools/register
// @access  Private (Developer only)
const registerSchool = asyncHandler(async (req, res) => {
  const { schoolName, schoolAddress, adminName, adminEmail, adminPassword } = req.body;

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
    const [savedAdmin, savedSchool] = await Promise.all([
      adminUser.save(),
      school.save(),
    ]);

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
    // Rollback on failure
    await User.deleteOne({ _id: adminUser._id }).catch(() => {});
    await School.deleteOne({ _id: school._id }).catch(() => {});
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

  const [totalStudents, totalBooks, totalStaff] = await Promise.all([
    Student.countDocuments({ school: schoolId }),
    Book.countDocuments({ school: schoolId }),
    User.countDocuments({
      school: schoolId,
      role: { $in: ['SchoolAdmin', 'Librarian'] },
    }),
  ]);

  res.status(200).json({
    totalStudents,
    totalBooks,
    borrowedBooks: 0, // Implement later
    totalStaff,
  });
});

// @desc    Get school profile
// @route   GET /api/v1/schools/profile
// @access  Private (SchoolStaff)
const getSchoolProfile = asyncHandler(async (req, res) => {
  const school = await School.findById(req.user.school);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }
  res.status(200).json(school);
});

// @desc    Update school profile + logo
// @route   PUT /api/v1/schools/profile
// @access  Private (SchoolAdmin only)
const updateSchoolProfile = asyncHandler(async (req, res) => {
  console.log('updateSchoolProfile: Multer passed. File:', req.file ? 'YES' : 'NO');

  const school = await School.findById(req.user.school);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }

  // Update text fields
  school.name = req.body.name?.trim() || school.name;
  school.address = req.body.address?.trim() || school.address;
  school.motto = req.body.motto?.trim() || school.motto;

  // Handle logo upload
  if (req.file) {
    console.log('New logo uploaded:', req.file.public_id);

    // Delete old logo from Cloudinary
    if (school.logoPublicId) {
      try {
        await cloudinary.uploader.destroy(school.logoPublicId);
        console.log('Old logo deleted:', school.logoPublicId);
      } catch (err) {
        console.warn('Failed to delete old logo:', err.message);
        // Continue — don't fail update
      }
    }

    // Save new logo
    school.logo = req.file.path;           // Cloudinary URL
    school.logoPublicId = req.file.public_id; // For future deletion
  }

  const updatedSchool = await school.save();

  res.status(200).json({
    success: true,
    message: 'School profile updated',
    data: updatedSchool,
  });
});

// --- EXPORT ---
export {
  registerSchool,
  getAllSchools,
  getSchoolDashboardStats,
  getSchoolProfile,
  updateSchoolProfile,
};