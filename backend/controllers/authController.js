import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import School from '../models/School.js';
import { logActivity } from '../services/activityLogService.js';

/**
 * @desc    Register the first Developer account
 * @route   POST /api/v1/auth/register-developer
 * @access  Public
 */
const registerDeveloper = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check if a developer account already exists
  const developerExists = await User.findOne({ role: 'Developer' });
  if (developerExists) {
    res.status(403); // Forbidden
    throw new Error('A Developer account already exists.');
  }

  // 2. Check if email is already in use
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // 3. Create the new developer user
  const user = await User.create({
    name,
    email,
    password,
    role: 'Developer',
  });

  if (user) {
    // 4. Generate token and set cookie
    generateToken(res, user._id, user.role, user.school);

    // 5. Send back user data (without password)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Auth user & get token (Login)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find the user by email
  const user = await User.findOne({ email });

  // 2. Check if user exists and password matches
  if (user && (await user.matchPassword(password))) {
    // 3. Generate token and set cookie
    generateToken(res, user._id, user.role, user.school);

    // 4. Log the login action
    await logActivity(
      user._id,
      user.school, // Will be null for Developer
      'USER_LOGIN',
      `User ${user.name} (${user.email}) logged in.`,
      req.ip
    );

    // 5. Send back user data
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Check a user's email and return associated school
 * @route   POST /api/v1/auth/check-email
 * @access  Public
 */
const checkUserByEmail = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  const user = await User.findOne({ email }).populate('school', 'name');

  if (!user) {
    res.status(404);
    throw new Error('User with this email not found');
  }

  // Check if the user's role matches the login type (e.g., 'Student')
  if (user.role !== role) {
    res.status(403);
    throw new Error(`This email is not registered as a ${role}.`);
  }

  // For Developer, school is null
  let schoolName = null;
  if (user.school) {
    schoolName = user.school.name;
  } else if (user.role !== 'Developer') {
    // A student or admin MUST have a school
    res.status(404);
    throw new Error('User is not associated with a school.');
  }

  res.status(200).json({
    name: user.name,
    schoolName: schoolName, // Will be null for Developer
  });
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      school: user.school,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  registerDeveloper,
  loginUser,
  checkUserByEmail,
  logoutUser,
  getMe,
};