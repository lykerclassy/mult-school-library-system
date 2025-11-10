import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import School from '../models/School.js';
import User from '../models/User.js';

// POST /api/schools/register
// Creates a School and a SCHOOL_ADMIN user (adminEmail, adminPassword)
const registerSchool = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503);
    return res.json({ message: 'Database not connected' });
  }

  const { schoolName, address, contactPhone, adminEmail, adminPassword } = req.body || {};

  if (!schoolName || !address || !adminEmail || !adminPassword) {
    res.status(400);
    return res.json({ message: 'Required fields: schoolName, address, adminEmail, adminPassword' });
  }

  const email = String(adminEmail).trim().toLowerCase();

  // check if admin email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    return res.json({ message: 'Admin email already in use' });
  }

  // create school first
  const school = await School.create({
    name: schoolName,
    address,
    contactPhone,
  });

  if (!school) {
    res.status(500);
    return res.json({ message: 'Failed to create school' });
  }

  // create admin user and link to school
  try {
    const adminUser = await User.create({
      name: email.split('@')[0],
      email,
      password: adminPassword,
      role: 'SCHOOL_ADMIN',
      school: school._id,
    });

    // attach admin to school
    school.admin = adminUser._id;
    await school.save();

    res.status(201).json({ message: 'School and admin created', school: { _id: school._id, name: school.name, address: school.address, contactPhone: school.contactPhone }, admin: { _id: adminUser._id, email: adminUser.email, role: adminUser.role } });
  } catch (err) {
    // cleanup created school if admin creation failed
    console.error('Error creating admin for school:', err);
    try { await School.findByIdAndDelete(school._id); } catch (e) { /* ignore */ }

    if (err.code === 11000) {
      res.status(400);
      return res.json({ message: 'Duplicate key error creating admin' });
    }

    res.status(500);
    return res.json({ message: 'Server error creating admin' });
  }
});

// GET /api/schools
// Returns list of schools (with admin email optionally)
const getSchools = asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503);
    return res.json({ message: 'Database not connected' });
  }

  const schools = await School.find().populate({ path: 'admin', select: 'name email role' }).lean();
  res.json(schools);
});

export { registerSchool, getSchools };