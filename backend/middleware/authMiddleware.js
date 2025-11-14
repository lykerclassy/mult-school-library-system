// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Protect routes - checks for valid JWT
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read the JWT from the httpOnly cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token's 'userId' and attach it to the request object
      // Exclude the password field
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next(); // Move to the next middleware or route handler
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

// Middleware to check for any school staff (Admin or Librarian)
const isSchoolStaff = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'SchoolAdmin' || req.user.role === 'Librarian')
  ) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized. School Staff access only.');
  }
};

export { protect, isDeveloper, isSchoolAdmin, isSchoolStaff };