// backend/utils/generateToken.js

import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role, schoolId) => {
  const token = jwt.sign({ userId, role, school: schoolId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // False in dev
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'lax' works best for localhost
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;