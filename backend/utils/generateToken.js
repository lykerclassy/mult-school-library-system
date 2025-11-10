import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role, schoolId) => {
  // We package the user's ID, role, and school affiliation
  // into the token. This is the key to our multi-tenant system.
  const token = jwt.sign(
    { userId, role, schoolId },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d', // Stays logged in for 30 days
    }
  );

  // We'll send the token back as an httpOnly cookie
  // This is more secure than storing it in localStorage
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;