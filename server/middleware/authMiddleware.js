const jwt = require('jsonwebtoken');
const { getAuth } = require('@clerk/express');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // First, support existing JWT-based auth
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  // Fallback to Clerk-based auth
  const auth = getAuth(req);

  if (!auth || !auth.userId) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  const clerkId = auth.userId;

  try {
    let user = await User.findOne({ clerkId }).select('-password');

    // Auto-create user record for new Clerk user
    if (!user) {
      user = await User.create({
        clerkId,
        name: 'Clerk User',
        email: `${clerkId}@example.com`,
        password: `__clerk_${clerkId}__placeholder__`,
      });
      user = user.toObject();
      delete user.password;
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Auth error' });
  }
};

module.exports = authMiddleware;


