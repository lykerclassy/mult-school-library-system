// backend/controllers/schoolController.js

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import School from '../models/School.js';
import Book from '../models/Book.js';
import Student from '../models/Student.js';
import Transaction from '../models/Transaction.js';
import { sendEmail } from '../services/emailService.js';
import { cloudinary } from '../config/cloudinary.js';

// --- Import all models needed for deletion ---
import Announcement from '../models/Announcement.js';
import Assignment from '../models/Assignment.js';
import ClassLevel from '../models/ClassLevel.js';
import ManualQuiz from '../models/ManualQuiz.js';
import Notification from '../models/Notification.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Resource from '../models/Resource.js';
import Subject from '../models/Subject.js';
import Submission from '../models/Submission.js';
import SupportTicket from '../models/SupportTicket.js';
import Timetable from '../models/Timetable.js';

/**
 * @desc    Register a new school
 * @route   POST /api/v1/schools/register
 * @access  Private (Developer)
 */
const registerSchool = asyncHandler(async (req, res) => {
  const { schoolName, schoolAddress, adminName, adminEmail, adminPassword } =
    req.body;
  
  const schoolExists = await School.findOne({ name: schoolName });
  if (schoolExists) {
    res.status(400); throw new Error('A school with this name already exists');
  }
  
  const adminExists = await User.findOne({ email: adminEmail });
  if (adminExists) {
    res.status(400); throw new Error('A user with this email already exists');
  }

  // Create the admin user
  const adminUser = new User({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'SchoolAdmin',
  });
  
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30); // 30-day trial
  
  const school = new School({
    name: schoolName,
    address: schoolAddress,
    admin: adminUser._id,
    subscriptionStatus: 'Trialing',
    nextBillingDate: nextBillingDate,
  });
  
  adminUser.school = school._id; // Link the admin to the school

  try {
    const savedAdmin = await adminUser.save();
    const savedSchool = await school.save();

    // Send Welcome Email
    try {
      const emailHtml = `
        <h1>Welcome to Your New School Portal!</h1>
        <p>Hello ${adminName}, your school, <strong>${schoolName}</strong>, has been created.</p>
        <p>You can now log in as the School Administrator using these credentials:</p>
        <p><strong>Email:</strong> ${adminEmail}</p>
        <p><strong>Password:</strong> ${adminPassword} (This was your initial password)</p>
        <p>Please log in and change your password in the Settings page.</p>
      `;
      await sendEmail(adminEmail, "Your New School Account Created", emailHtml);
    } catch (emailError) {
      console.error("Failed to send welcome email to admin:", emailError);
    }

    res.status(201).json({
      message: 'School registered successfully',
      school: savedSchool,
      admin: {
        _id: savedAdmin._id, name: savedAdmin.name,
        email: savedAdmin.email, role: savedAdmin.role,
      },
    });
  } catch (error) {
    // Clean up if something fails
    await User.deleteOne({ _id: adminUser._id });
    await School.deleteOne({ _id: school._id });
    res.status(400);
    throw new Error(`Failed to register school: ${error.message}`);
  }
});

/**
 * @desc    Get all schools (for Developer Portal)
 * @route   GET /api/v1/schools
 * @access  Private (Developer)
 */
const getAllSchools = asyncHandler(async (req, res) => {
  const schools = await School.find({})
    .populate('admin', 'name email')
    .populate('plan', 'name');
  res.status(200).json(schools);
});

/**
 * @desc    Get dashboard stats for a School Admin
 * @route   GET /api/v1/schools/stats
 * @access  Private (SchoolAdmin)
 */
const getSchoolDashboardStats = asyncHandler(async (req, res) => {
  const schoolId = req.user.school;
  const totalStudents = await Student.countDocuments({ school: schoolId });
  const totalBooks = await Book.countDocuments({ school: schoolId });
  const borrowedBooks = await Transaction.countDocuments({ 
    school: schoolId, 
    status: { $in: ['Issued', 'Overdue'] } 
  });
  const totalStaff = await User.countDocuments({
    school: schoolId,
    role: { $in: ['SchoolAdmin', 'Librarian', 'Teacher'] },
  });
  res.status(200).json({
    totalStudents,
    totalBooks,
    borrowedBooks,
    totalStaff,
  });
});

/**
 * @desc    Get school profile for the logged-in admin
 * @route   GET /api/v1/schools/profile
 * @access  Private (SchoolAdmin or SchoolStaff)
 */
const getSchoolProfile = asyncHandler(async (req, res) => {
  const school = await School.findById(req.user.school).populate('plan');
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }
  res.status(200).json(school);
});

/**
 * @desc    Update school profile
 * @route   PUT /api/v1/schools/profile
 * @access  Private (SchoolAdmin)
 */
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
  school.plan = planId || null;
  school.subscriptionStatus = subscriptionStatus;
  school.nextBillingDate = nextBillingDate;
  const updatedSchool = await school.save();
  res.status(200).json(updatedSchool);
});

/**
 * @desc    Toggle a school's active status
 * @route   PUT /api/v1/schools/:id/toggle-status
 * @access  Private (Developer)
 */
const toggleSchoolStatus = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }
  if (school.subscriptionStatus === 'Active' || school.subscriptionStatus === 'Trialing') {
    school.subscriptionStatus = 'Canceled';
  } else {
    school.subscriptionStatus = 'Active';
  }
  const updatedSchool = await school.save();
  res.status(200).json(updatedSchool);
});

/**
 * @desc    Delete a school and all associated data
 * @route   DELETE /api/v1/schools/:id
 * @access  Private (Developer)
 */
const deleteSchool = asyncHandler(async (req, res) => {
  const schoolId = req.params.id;

  const school = await School.findById(schoolId);
  if (!school) {
    res.status(404);
    throw new Error('School not found');
  }

  // 1. Delete Cloudinary files (simplified: by folder)
  // We'll delete the main folder for that school
  // Note: This requires school name to be part of the folder path, which we didn't set up.
  // A simple delete of associated resources is safer for now.
  const resources = await Resource.find({ school: schoolId });
  if (resources.length > 0) {
    const resourcePublicIds = resources.map(r => r.cloudinaryPublicId);
    await cloudinary.api.delete_resources(resourcePublicIds, { resource_type: 'raw' });
  }

  // 2. Delete all data from all collections
  await User.deleteMany({ school: schoolId });
  await Student.deleteMany({ school: schoolId });
  await Book.deleteMany({ school: schoolId });
  await Transaction.deleteMany({ school: schoolId });
  await Announcement.deleteMany({ school: schoolId });
  await Assignment.deleteMany({ school: schoolId });
  await Submission.deleteMany({ school: schoolId });
  await ClassLevel.deleteMany({ school: schoolId });
  await Subject.deleteMany({ school: schoolId });
  await ManualQuiz.deleteMany({ school: schoolId });
  await QuizAttempt.deleteMany({ school: schoolId });
  await Resource.deleteMany({ school: schoolId });
  await SupportTicket.deleteMany({ school: schoolId });
  await Timetable.deleteMany({ school: schoolId });
  await Notification.deleteMany({ school: schoolId });
  
  // 3. Finally, delete the School itself
  await school.deleteOne();

  res.status(200).json({ message: 'School and all associated data deleted successfully' });
});


// --- EXPORT BLOCK ---
export {
  registerSchool,
  getAllSchools,
  getSchoolDashboardStats,
  getSchoolProfile,
  updateSchoolProfile,
  assignPlanToSchool,
  toggleSchoolStatus,
  deleteSchool,
};