import mongoose from 'mongoose';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';

// We need a small helper to handle try/catch blocks in async functions
// In your backend terminal, run: npm install express-async-handler
// This wraps our functions and catches errors automatically.

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user by email
  const user = await User.findOne({ email });

  // 2. Check if user exists and password matches
  if (user && (await user.matchPassword(password))) {
    // 3. Generate a token and send it as a cookie
    generateToken(res, user._id, user.role, user.school);

    // 4. Send back user data (without password)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new DEVELOPER user
// @route   POST /api/auth/register-dev
// @access  Public (for now, or make it private)
const registerDeveloper = asyncHandler(async (req, res) => {
  // Quick DB connection check
  if (mongoose.connection.readyState !== 1) {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    res.status(503);
    return res.json({ message: 'Database not connected' });
  }

  console.log('registerDeveloper body:', req.body);

  const { name, email, password } = req.body || {};

  // Basic validation
  if (!email || !password) {
    res.status(400);
    return res.json({ message: 'Email and password are required' });
  }

  // Normalize email
  const normalizedEmail = String(email).trim().toLowerCase();

  // 1. Check if email already exists
  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    res.status(400);
    return res.json({ message: 'User already exists with this email' });
  }

  // 2. Check if a Developer already exists (optional)
  const devExists = await User.findOne({ role: 'DEVELOPER' });
  if (devExists) {
    res.status(400);
    return res.json({ message: 'A Developer account already exists.' });
  }

  // 3. Create new user (wrap to catch duplicate-key errors)
  try {
    const user = await User.create({
      name: name ? String(name).trim() : undefined,
      email: normalizedEmail,
      password, // hashed by model pre-save
      role: 'DEVELOPER',
      school: null,
    });

    if (user) {
      generateToken(res, user._id, user.role, user.school);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400);
      res.json({ message: 'Invalid user data' });
    }
  } catch (err) {
    console.error('Error in registerDeveloper:', err);

    // Mongo duplicate key error
    if (err.code === 11000) {
      const dupField = Object.keys(err.keyValue || {}).join(', ');
      res.status(400);
      return res.json({ message: `Duplicate key error: ${dupField}` });
    }

    // Unexpected error
    res.status(500);
    return res.json({ message: 'Server error while registering developer' });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export { loginUser, registerDeveloper, logoutUser };