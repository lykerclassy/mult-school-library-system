// backend/middleware/limitMiddleware.js

import asyncHandler from 'express-async-handler';
import School from '../models/School.js';
import User from '../models/User.js';
import Student from '../models/Student.js';

/**
 * @desc    Checks if a school can add another student
 */
const checkStudentLimit = asyncHandler(async (req, res, next) => {
  const school = await School.findById(req.user.school).populate('plan');

  if (!school.plan) {
    // No plan, allow (or you could block all)
    return next();
  }

  const studentCount = await Student.countDocuments({ school: req.user.school });
  
  if (studentCount >= school.plan.studentLimit) {
    res.status(403); // Forbidden
    throw new Error(`You have reached your plan's limit of ${school.plan.studentLimit} students.`);
  }

  next();
});

/**
 * @desc    Checks if a school can add another staff member (Teacher/Librarian)
 */
const checkTeacherLimit = asyncHandler(async (req, res, next) => {
  const school = await School.findById(req.user.school).populate('plan');

  if (!school.plan) {
    return next();
  }

  const teacherCount = await User.countDocuments({
    school: req.user.school,
    role: { $in: ['Teacher', 'Librarian'] },
  });

  if (teacherCount >= school.plan.teacherLimit) {
    res.status(403);
    throw new Error(`You have reached your plan's limit of ${school.plan.teacherLimit} staff members.`);
  }

  next();
});

export { checkStudentLimit, checkTeacherLimit };