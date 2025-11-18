// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt; // Only check cookie

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) { res.status(401); throw new Error('User not found'); }
      next();
    } catch (error) {
      res.status(401); throw new Error('Token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// (Keep roles as is)
const isDeveloper = (req, res, next) => { if (req.user?.role === 'Developer') next(); else { res.status(403); throw new Error('Not authorized'); } };
const isSchoolAdmin = (req, res, next) => { if (req.user?.role === 'SchoolAdmin') next(); else { res.status(403); throw new Error('Not authorized'); } };
const isSchoolStaff = (req, res, next) => { if (['SchoolAdmin', 'Librarian', 'Teacher'].includes(req.user?.role)) next(); else { res.status(403); throw new Error('Not authorized'); } };

export { protect, isDeveloper, isSchoolAdmin, isSchoolStaff };