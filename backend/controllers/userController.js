// backend/controllers/userController.js

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * @desc    Create a new staff member (Librarian)
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

  // Only Admins can create Librarians
  if (role !== 'Librarian') {
    res.status(400);
    throw new Error('You can only create Librarian accounts.');
  }

  // Check if user email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Create the user
  const user = await User.create({
    name,
    email,
    password,
    role,
    school: schoolId,
  });

  if (user) {
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
    role: { $in: ['SchoolAdmin', 'Librarian'] }, // Find all staff
  })
    .select('-password')
    .sort({ name: 1 });

  res.status(200).json(staff);
});

export { createStaff, getStaff };