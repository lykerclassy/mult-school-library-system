import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Add a new Librarian
// @route   POST /api/users/add-librarian
// @access  Private (School Admin only)
const addLibrarian = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // 1. Check if email is taken
  const emailExists = await User.findOne({ email: email.toLowerCase() });
  if (emailExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // 2. Create the new librarian
  const librarian = await User.create({
    name,
    email,
    password, // Auto-hashed by the model
    role: 'LIBRARIAN',
    school: req.user.schoolId, // <-- MAGIC: Assigns to the Admin's school
  });

  if (librarian) {
    res.status(201).json({
      _id: librarian._id,
      name: librarian.name,
      email: librarian.email,
      role: librarian.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get all librarians for the admin's school
// @route   GET /api/users/librarians
// @access  Private (School Admin only)
const getSchoolLibrarians = asyncHandler(async (req, res) => {
  const librarians = await User.find({
    school: req.user.schoolId, // <-- MAGIC: Finds only for their school
    role: 'LIBRARIAN',
  }).select('-password');

  res.json(librarians);
});

export { addLibrarian, getSchoolLibrarians };