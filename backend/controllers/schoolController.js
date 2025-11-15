// backend/controllers/schoolController.js

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import School from '../models/School.js';
import Book from '../models/Book.js';
import Student from '../models/Student.js';

// ... (registerSchool, getAllSchools, getSchoolDashboardStats, getSchoolProfile, updateSchoolProfile functions are unchanged) ...
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
  // --- SET DEFAULT TRIAL DATE ---
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30); // 30-day trial
  // -----------------------------
  const school = new School({
    name: schoolName,
    address: schoolAddress,
    admin: adminUser._id,
    subscriptionStatus: 'Trialing',
    nextBillingDate: nextBillingDate,
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

const getAllSchools = asyncHandler(async (req, res) => {
  const schools = await School.find({})
    .populate('admin', 'name email')
    .populate('plan', 'name'); // <-- Populate plan name
  res.status(200).json(schools);
});

const getSchoolDashboardStats = asyncHandler(async (req, res) => {
  const schoolId = req.user.school;
  const totalStudents = await Student.countDocuments({ school: schoolId });
  const totalBooks = await Book.countDocuments({ school: schoolId });
  const borrowedBooks = await Transaction.countDocuments({ school: schoolId, status: 'Issued' }); // Real data
  const totalStaff = await User.countDocuments({
    school: schoolId,
    role: { $in: ['SchoolAdmin', 'Librarian', 'Teacher'] }, // Updated
  });
  res.status(200).json({
    totalStudents,
    totalBooks,
    borrowedBooks,
    totalStaff,
  });
});

const getSchoolProfile = asyncHandler(async (req, res) => {
  const school = await School.findById(req.user.school);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }
  res.status(200).json(school);
});

const updateSchoolProfile = asyncHandler(async (req, res) => {
  const school = await School.findById(req.user.school);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }
  school.name = req.body.name || school.name;
  school.address = req.body.address || school.address;
  school.motto = req.body.motto || school.motto;
  if (req.file) {
    school.logo = req.file.path;
  }
  const updatedSchool = await school.save();
  res.status(200).json(updatedSchool);
});

// --- NEW FUNCTION ---
/**
 * @desc    Assign a subscription plan to a school
 * @route   PUT /api/v1/schools/:id/assign-plan
 * @access  Private (Developer)
 */
const assignPlanToSchool = asyncHandler(async (req, res) => {
  const { planId, subscriptionStatus, nextBillingDate } = req.body;
  const school = await School.findById(req.params.id);

  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }

  school.plan = planId;
  school.subscriptionStatus = subscriptionStatus;
  school.nextBillingDate = nextBillingDate;

  const updatedSchool = await school.save();
  res.status(200).json(updatedSchool);
});

export {
  registerSchool,
  getAllSchools,
  getSchoolDashboardStats,
  getSchoolProfile,
  updateSchoolProfile,
  assignPlanToSchool, // <-- EXPORT
};