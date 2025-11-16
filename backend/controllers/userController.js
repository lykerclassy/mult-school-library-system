// backend/controllers/userController.js

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import School from '../models/School.js';
import { sendEmail } from '../services/emailService.js';

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

const getStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({
    school: req.user.school,
    role: { $in: ['SchoolAdmin', 'Librarian', 'Teacher'] },
  })
    .select('-password')
    .sort({ name: 1 });
  res.status(200).json(staff);
});

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

const getParents = asyncHandler(async (req, res) => {
  const parents = await User.find({
    school: req.user.school,
    role: 'Parent',
  })
  .select('-password')
  .sort({ name: 1 });
  
  res.status(200).json(parents);
});

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

  // This line will work now
  const paginatedResults = await User.paginate(query, options);
  res.status(200).json(paginatedResults);
});

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

const changeUserRole = asyncHandler(async (req, res) => {
  const { newRole } = req.body;
  const validRoles = ['SchoolAdmin', 'Librarian', 'Teacher', 'Student', 'Parent'];

  if (!newRole || !validRoles.includes(newRole)) {
    res.status(400);
    throw new Error('Please select a valid role');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'Developer') {
    res.status(400);
    throw new Error('Cannot change Developer role');
  }

  user.role = newRole;
  await user.save();
  
  res.status(200).json({ message: 'User role updated successfully' });
});


export {
  createStaff,
  getStaff,
  updateUserProfile,
  deleteStaff,
  createParent,
  getParents,
  getAllUsers,
  resetUserPassword,
  changeUserRole,
};