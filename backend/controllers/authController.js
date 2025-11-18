// backend/controllers/authController.js

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import School from '../models/School.js';
import { logActivity } from '../services/activityLogService.js';

const registerDeveloper = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const developerExists = await User.findOne({ role: 'Developer' });
  if (developerExists) { res.status(403); throw new Error('A Developer account already exists.'); }
  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error('User already exists'); }

  const user = await User.create({ name, email, password, role: 'Developer' });

  if (user) {
    generateToken(res, user._id, user.role, user.school); // Set Cookie
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role, school: user.school,
    });
  } else {
    res.status(400); throw new Error('Invalid user data');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id, user.role, user.school); // Set Cookie
    await logActivity(user._id, user.school, 'USER_LOGIN', `User ${user.name} logged in.`, req.ip);

    res.status(200).json({
      _id: user._id, name: user.name, email: user.email, role: user.role, school: user.school,
    });
  } else {
    res.status(401); throw new Error('Invalid email or password');
  }
});

const demoLogin = asyncHandler(async (req, res) => {
  const DEMO_ADMIN_EMAIL = 'demo@springfield.com';
  const user = await User.findOne({ email: DEMO_ADMIN_EMAIL });
  if (!user) { res.status(404); throw new Error('Demo account not set up'); }

  await logActivity(user._id, user.school, 'DEMO_LOGIN', `Demo session`, req.ip);
  generateToken(res, user._id, user.role, user.school); // Set Cookie

  res.status(200).json({
    _id: user._id, name: user.name, email: user.email, role: user.role, school: user.school,
  });
});

// (Keep other functions exactly as is)
const checkUserByEmail = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const user = await User.findOne({ email }).populate('school', 'name');
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role !== role) { res.status(403); throw new Error(`Email not registered as ${role}`); }
  res.status(200).json({ name: user.name, schoolName: user.school?.name || null });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out' });
});

const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user) {
    res.status(200).json({ _id: user._id, name: user.name, email: user.email, role: user.role, school: user.school });
  } else { res.status(404); throw new Error('User not found'); }
});

const impersonateUser = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) { res.status(404); throw new Error('Target user not found'); }
  
  generateToken(res, targetUser._id, targetUser.role, targetUser.school); // Set Cookie
  res.status(200).json({
    _id: targetUser._id, name: targetUser.name, email: targetUser.email, role: targetUser.role, school: targetUser.school,
  });
});

export { registerDeveloper, loginUser, checkUserByEmail, logoutUser, getMe, demoLogin, impersonateUser };