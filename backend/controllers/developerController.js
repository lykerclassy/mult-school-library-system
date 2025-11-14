// backend/controllers/developerController.js
import asyncHandler from 'express-async-handler';
import School from '../models/School.js';

const getAllSchools = asyncHandler(async (req, res) => {
  const schools = await School.find({})
    .populate('admin', 'name email')
    .select('-__v')
    .sort({ createdAt: -1 });

  res.json(schools);
});

export { getAllSchools };