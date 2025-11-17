// backend/utils/generateToken.js

import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role, schoolId) => {
  // Create the token payload
  const payload = {
    userId,
    role,
    schoolId, // Will be null for 'Developer'
  };

  // --- DEBUGGING: ADD THIS ---
  console.log('--- 1. GENERATING TOKEN ---');
  console.log('SECRET USED TO SIGN:', process.env.JWT_SECRET);
  // --- END DEBUGGING ---

  // Sign the token
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set the token as an httpOnly, secure cookie
  res.cookie('jwt', token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production (HTTPS)
    sameSite: 'lax', // Changed from 'strict' to 'lax'
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;