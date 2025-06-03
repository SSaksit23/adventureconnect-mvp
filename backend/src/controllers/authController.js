// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { generateToken } = require('../config/auth');
const { sendEmail } = require('../utils/email');

// Register new user
const register = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, firstName, lastName, userType } = req.body;

    // Validate user type
    if (!['traveler', 'provider'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Check if user exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    await client.query('BEGIN');

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, password, first_name, last_name, user_type) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, first_name, last_name, user_type`,
      [email, hashedPassword, firstName, lastName, userType]
    );

    const user = userResult.rows[0];

    // If provider, create provider profile
    if (userType === 'provider') {
      await client.query(
        'INSERT INTO provider_profiles (user_id) VALUES ($1)',
        [user.id]
      );
    }

    await client.query('COMMIT');

    // Generate token
    const token = generateToken(user.id);

    // Send welcome email
    const emailTemplate = userType === 'provider' ? 'welcomeProvider' : 'welcomeTraveler';
    await sendEmail(email, emailTemplate, { firstName });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    client.release();
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.user_type, u.is_verified
      FROM users u
      WHERE u.id = $1
    `;

    // If provider, get additional profile data
    if (req.user.user_type === 'provider') {
      query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.user_type, u.is_verified,
               p.business_name, p.bio, p.expertise, p.location, p.languages, 
               p.years_experience, p.profile_image, p.is_approved
        FROM users u
        LEFT JOIN provider_profiles p ON u.id = p.user_id
        WHERE u.id = $1
      `;
    }

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};