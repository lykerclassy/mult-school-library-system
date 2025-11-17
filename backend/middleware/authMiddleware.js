// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Protect routes - checks for valid JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;

  if (token) {
    try {
      // --- DEBUGGING: ADD THIS ---
      console.log('--- 2. VERIFYING TOKEN ---');
      console.log('SECRET USED TO VERIFY:', process.env.JWT_SECRET);
      console.log('TOKEN BEING VERIFIED:', token); // <-- NEW LINE
      // --- END DEBUGGING ---

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      next();
    } catch (error) {
      console.error(error); // This will log the error
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware to check for 'Developer' role
const isDeveloper = (req, res, next) => {
  if (req.user && req.user.role === 'Developer') {
    next();
  } else {
    res.status(403); // Forbidden
    throw new Error('Not authorized. Developer access only.');
  }
};

// Middleware to check for 'SchoolAdmin' role
const isSchoolAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SchoolAdmin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized. School Admin access only.');
  }
};

// Middleware to check for any school staff (Admin, Librarian, OR Teacher)
const isSchoolStaff = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'SchoolAdmin' ||
      req.user.role === 'Librarian' ||
      req.user.role === 'Teacher')
  ) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized. School Staff access only.');
  }
};

export { protect, isDeveloper, isSchoolAdmin, isSchoolStaff };