// backend/controllers/userController.js

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import School from '../models/School.js';
import { sendEmail } from '../services/emailService.js';

/**
 * @desc    Create a new staff member (Librarian or Teacher)
 * @route   POST /api/v1/users/staff
 * @access  Private (SchoolAdmin)
 */
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const schoolId = req.user.school;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  if (role !== 'Librarian' && role !== 'Teacher') {
    res.status(400);
    throw new Error('You can only create Librarian or Teacher accounts.');
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }
  const user = await User.create({
    name,
    email,
    password,
    role,
    school: schoolId,
  });

  if (user) {
    try {
      const school = await School.findById(schoolId).select('name');
      const emailHtml = `
        <h1>Welcome to ${school.name}'s Staff Portal!</h1>
        <p>Hello ${name}, an account has been created for you with the role of ${role}.</p>
        <p>You can now log in using the following credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please log in and change your password in the Settings page.</p>
      `;
      await sendEmail(email, "Your New Staff Account", emailHtml);
    } catch (emailError) {
      console.error("Failed to send welcome email to staff:", emailError);
    }
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Get all staff for the school
 * @route   GET /api/v1/users/staff
 * @access  Private (SchoolAdmin)
 */
const getStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({
    school: req.user.school,
    role: { $in: ['SchoolAdmin', 'Librarian', 'Teacher'] },
  })
    .select('-password')
    .sort({ name: 1 });
  res.status(200).json(staff);
});

/**
 * @desc    Update a user's own profile
 * @route   PUT /api/v1/users/profile
 * @access  Private (All users)
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password) {
    user.password = req.body.password;
  }
  const updatedUser = await user.save();
  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});

/**
 * @desc    Delete a staff member
 * @route   DELETE /api/v1/users/staff/:id
 * @access  Private (SchoolAdmin)
 */
const deleteStaff = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account.');
  }
  if (
    user.school.toString() !== req.user.school.toString() ||
    !['Librarian', 'Teacher'].includes(user.role)
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this user');
  }
  await user.deleteOne();
  res.status(200).json({ message: 'User deleted successfully' });
});

/**
 * @desc    Create a new parent
 * @route   POST /api/v1/users/parent
 * @access  Private (SchoolAdmin)
 */
const createParent = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }
  const parent = await User.create({
    name,
    email,
    password,
    role: 'Parent',
    school: req.user.school,
  });
  if (parent) {
    try {
      const school = await School.findById(req.user.school).select('name');
      const emailHtml = `
        <h1>Welcome to ${school.name}'s Parent Portal!</h1>
        <p>Hello ${name}, an account has been created for you.</p>
        <p>You can now log in using the following credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please log in and change your password in the Settings page.</p>
      `;
      await sendEmail(email, "Your New Parent Account", emailHtml);
    } catch (emailError) {
      console.error("Failed to send welcome email to parent:", emailError);
    }
  }
  res.status(201).json({
    _id: parent._id,
    name: parent.name,
    email: parent.email,
  });
});

/**
 * @desc    Get all parents for the school
 * @route   GET /api/v1/users/parents
 * @access  Private (SchoolAdmin)
 */
const getParents = asyncHandler(async (req, res) => {
  const parents = await User.find({
    school: req.user.school,
    role: 'Parent',
  })
  .select('-password')
  .sort({ name: 1 });
  
  res.status(200).json(parents);
});

// --- This export block must be 100% correct ---
export {
  createStaff,
  getStaff,
  updateUserProfile,
  deleteStaff,
  createParent,
  getParents,
};