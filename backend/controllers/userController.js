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

  if (role !== 'Librarian') {
    res.status(400);
    throw new Error('You can only create Librarian accounts.');
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
    role: { $in: ['SchoolAdmin', 'Librarian'] },
  })
    .select('-password')
    .sort({ name: 1 });

  res.status(200).json(staff);
});

// --- NEW FUNCTION ---
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
    user.password = req.body.password; // Mongoose 'pre-save' hook will hash it
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});

// --- NEW FUNCTION ---
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

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account.');
  }

  // Ensure they are deleting a staff member from their school
  if (
    user.school.toString() !== req.user.school.toString() ||
    user.role === 'Student' ||
    user.role === 'Developer'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this user');
  }

  await user.deleteOne();
  res.status(200).json({ message: 'User deleted successfully' });
});


export { createStaff, getStaff, updateUserProfile, deleteStaff };