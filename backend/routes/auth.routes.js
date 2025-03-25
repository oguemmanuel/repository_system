const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db/db');
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

// Environment variables for registration codes
const ADMIN_REGISTRATION_CODE = process.env.ADMIN_REGISTRATION_CODE || 'admin123';
const SUPERVISOR_REGISTRATION_CODE = process.env.SUPERVISOR_REGISTRATION_CODE || 'supervisor123';

// User Registration Route
router.post('/register', async (req, res) => {
  try {
    const { 
      full_name, 
      email, 
      index_number, 
      phone_number, 
      password, 
      user_type = 'student',
      registration_code 
    } = req.body;

    // Input validation
    if (!full_name || !email || !index_number || !phone_number || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Validate registration codes for special roles
    if (user_type === 'admin') {
      if (!registration_code || registration_code !== ADMIN_REGISTRATION_CODE) {
        return res.status(403).json({ 
          success: false,
          message: 'Invalid or missing registration code for admin' 
        });
      }
    }

    if (user_type === 'supervisor') {
      if (!registration_code || registration_code !== SUPERVISOR_REGISTRATION_CODE) {
        return res.status(403).json({ 
          success: false,
          message: 'Invalid or missing registration code for supervisor' 
        });
      }
    }

    // Check if email already exists
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (full_name, email, index_number, phone_number, password, user_type) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, index_number, phone_number, hashedPassword, user_type]
    );

    // Create session
    req.session.userId = result.insertId;
    req.session.userType = user_type;

    // Successful response
    res.status(201).json({ 
      success: true,
      message: `${user_type.charAt(0).toUpperCase() + user_type.slice(1)} registered successfully`,
      redirectTo: `/dashboard/${user_type}`,
      userType: user_type
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// In your auth routes file
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Check if user exists
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.userType = user.user_type;

    // Send success response
    res.json({
      success: true,
      message: 'Login successful',
      userType: user.user_type,
      redirectTo: `/dashboard/${user.user_type}`
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user info
router.get('/user-info', isAuthenticated, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, full_name, email, index_number, phone_number, user_type, created_at FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user information',
      error: error.message
    });
  }
});

// Get all users (admin only)
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, full_name, email, index_number, phone_number, user_type, created_at FROM users'
    );

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get user by ID (admin only)
router.get('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, full_name, email, index_number, phone_number, user_type, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

module.exports = router;