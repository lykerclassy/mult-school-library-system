import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// ... (existing 'protect' and 'isDeveloper' functions) ...
const protect = asyncHandler(async (req, res, next) => {
  // ... (no changes here)
  let token;
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const isDeveloper = (req, res, next) => {
  // ... (no changes here)
  if (req.user && req.user.role === 'DEVELOPER') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a Developer');
  }
};

// --- ADD THESE NEW FUNCTIONS ---

// Middleware to check if user is a School Admin
const isSchoolAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SCHOOL_ADMIN') {
    next();
  } else {
    res.status(403); // 403 Forbidden
    throw new Error('Not authorized as a School Admin');
  }
};

// Middleware to check if user is EITHER an Admin or Librarian
const isSchoolStaff = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'SCHOOL_ADMIN' || req.user.role === 'LIBRARIAN')
  ) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as School Staff');
  }
};

export { protect, isDeveloper, isSchoolAdmin, isSchoolStaff };