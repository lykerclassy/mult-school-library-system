// backend/controllers/userController.js

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// --- (createStaff function is unchanged) ---
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

// --- (getStaff function is unchanged) ---
const getStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({
    school: req.user.school,
    role: { $in: ['SchoolAdmin', 'Librarian', 'Teacher'] },
  })
    .select('-password')
    .sort({ name: 1 });
  res.status(200).json(staff);
});

// --- (updateUserProfile function is unchanged) ---
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

// --- (deleteStaff function is unchanged) ---
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

// --- (createParent function is unchanged) ---
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
  res.status(201).json({
    _id: parent._id,
    name: parent.name,
    email: parent.email,
  });
});

// --- NEW FUNCTION ---
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

export {
  createStaff,
  getStaff,
  updateUserProfile,
  deleteStaff,
  createParent,
  getParents, // <-- EXPORT
};