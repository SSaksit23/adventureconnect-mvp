// backend/src/config/auth.js
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};

// backend/src/middleware/auth.js
const { verifyToken } = require('../config/auth');
const { pool } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    
    // Get user from database
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, user_type FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const authorizeProvider = async (req, res, next) => {
  if (req.user.user_type !== 'provider') {
    return res.status(403).json({ error: 'Access denied. Providers only.' });
  }
  next();
};

const authorizeTraveler = async (req, res, next) => {
  if (req.user.user_type !== 'traveler') {
    return res.status(403).json({ error: 'Access denied. Travelers only.' });
  }
  next();
};

module.exports = {
  authenticate,
  authorizeProvider,
  authorizeTraveler
};