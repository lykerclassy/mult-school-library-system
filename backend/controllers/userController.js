// backend/controllers/userController.js

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import School from '../models/School.js';
import { sendEmail } from '../services/emailService.js';

// --- (createStaff, getStaff, updateUserProfile, deleteStaff, createParent, getParents are unchanged) ---
const createStaff = asyncHandler(async (req, res) => { /* ... */ });
const getStaff = asyncHandler(async (req, res) => { /* ... */ });
const updateUserProfile = asyncHandler(async (req, res) => { /* ... */ });
const deleteStaff = asyncHandler(async (req, res) => { /* ... */ });
const createParent = asyncHandler(async (req, res) => { /* ... */ });
const getParents = asyncHandler(async (req, res) => { /* ... */ });

// --- NEW FUNCTION ---
/**
 * @desc    Get all users (for Developer)
 * @route   GET /api/v1/users/all
 * @access  Private (Developer)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  const query = {
    role: { $ne: 'Developer' }, // Don't show the developer
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    populate: { path: 'school', select: 'name' },
  };

  const paginatedResults = await User.paginate(query, options);
  res.status(200).json(paginatedResults);
});

// --- NEW FUNCTION ---
/**
 * @desc    Reset a user's password (by Developer)
 * @route   PUT /api/v1/users/:id/reset-password
 * @access  Private (Developer)
 */
const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.password = newPassword;
  await user.save();

  // Send them an email
  try {
    const emailHtml = `
      <h1>Your Password Has Been Reset</h1>
      <p>Hello ${user.name}, your password for the library platform has been reset by an administrator.</p>
      <p>Your new temporary password is: <strong>${newPassword}</strong></p>
      <p>Please log in immediately and change it in your Settings.</p>
    `;
    await sendEmail(user.email, "Your Password Has Been Reset", emailHtml);
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError);
  }

  res.status(200).json({ message: 'Password reset successfully' });
});


export {
  createStaff,
  getStaff,
  updateUserProfile,
  deleteStaff,
  createParent,
  getParents,
  getAllUsers, // <-- EXPORT
  resetUserPassword, // <-- EXPORT
};