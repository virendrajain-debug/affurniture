// ============================================================
// Authentication API Routes
// ============================================================
// Handles all auth-related operations:
//   POST   /api/auth/login           - Admin login (returns JWT)
//   POST   /api/auth/forgot-password  - Request password reset OTP
//   POST   /api/auth/verify-otp      - Verify OTP code
//   POST   /api/auth/reset-password  - Set new password
//   GET    /api/auth/profile         - Get current user profile (protected)
//   PUT    /api/auth/profile         - Update profile info (protected)
//   PUT    /api/auth/change-password - Change password (protected)
//
// AUTHENTICATION FLOW:
//   1. Login with email/password -> get JWT token
//   2. Send token in header: Authorization: Bearer <token>

import BACKEND_URL from '../helpers/backendUrl.js';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }
//   3. Protected routes check token via authenticateToken middleware
// ============================================================

import { Router } from 'express';
import bcrypt from 'bcryptjs';     // For hashing/comparing passwords
import jwt from 'jsonwebtoken';    // For creating/verifying JWT tokens
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendOTPEmail } from '../utils/email.js';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

// -----------------------------------------------------------
// POST /api/auth/login
// -----------------------------------------------------------
// Login with email and password. Returns a JWT token.
//
// REQUEST BODY:
//   { "email": "admin@gmail.com", "password": "admin123" }
//
// RESPONSE (success):
//   { "message": "Login successful", "token": "eyJ...", "user": { "id": 1, "name": "Admin", ... } }
//
// RESPONSE (error):
//   { "message": "Invalid credentials" }
// -----------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Look up user by email
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Compare provided password with stored bcrypt hash
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token containing user info (expires in 7 days)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Return token and user info (no password!)
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, profile_image: resolveUrl(user.profile_image) }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// POST /api/auth/forgot-password
// -----------------------------------------------------------
// Send a 6-digit OTP to the user's email for password reset.
//
// REQUEST BODY:
//   { "email": "admin@gmail.com" }
//
// RESPONSE:
//   { "message": "OTP sent to your email" }
//
// NOTE: The OTP is logged to console (for dev).
// In production, send it via email service (SendGrid, etc.)
// -----------------------------------------------------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if user exists (don't reveal if email exists or not)
    const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.json({ message: 'If the email exists, an OTP has been sent' });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // Expires in 10 minutes

    // Store OTP in database
    await pool.execute('UPDATE users SET otp = ?, otp_expires_at = ? WHERE email = ?', [otp, expiresAt, email]);

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp);
      console.log(`OTP sent to ${email}`);
    } catch (emailErr) {
      console.error('Email send failed (OTP still generated):', emailErr.message);
    }
    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// POST /api/auth/verify-otp
// -----------------------------------------------------------
// Verify the OTP code and return a reset token.
//
// REQUEST BODY:
//   { "email": "admin@gmail.com", "otp": "123456" }
//
// RESPONSE (success):
//   { "message": "OTP verified successfully", "resetToken": "eyJ..." }
// -----------------------------------------------------------
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    // Look up user's stored OTP
    const [users] = await pool.execute(
      'SELECT id, otp, otp_expires_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const user = users[0];
    
    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP has expired
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Clear the OTP from database (one-time use)
    await pool.execute('UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE email = ?', [email]);
    
    // Return a short-lived reset token (15 minutes)
    res.json({ 
      message: 'OTP verified successfully', 
      resetToken: jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' }) 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// POST /api/auth/reset-password
// -----------------------------------------------------------
// Set a new password using the reset token from OTP verification.
//
// REQUEST BODY:
//   { "email": "admin@gmail.com", "newPassword": "newpass123", "resetToken": "eyJ..." }
// -----------------------------------------------------------
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;
    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify the reset token is valid and not expired
    jwt.verify(resetToken, process.env.JWT_SECRET);

    // Hash the new password and update it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Invalid or expired reset token' });
  }
});

// -----------------------------------------------------------
// GET /api/auth/profile
// -----------------------------------------------------------
// Get the logged-in user's profile. Requires valid JWT token.
//
// HEADERS: Authorization: Bearer <token>
//
// RESPONSE:
//   { "id": 1, "name": "Admin", "email": "admin@gmail.com", "profile_image": "...", "role": "admin" }
// -----------------------------------------------------------
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Profile request from user:', req.user);
    const [users] = await pool.execute('SELECT id, name, email, profile_image, role FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      console.log('Profile: user not found for id:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    const [socials] = await pool.execute('SELECT platform, url FROM social_links WHERE enabled = 1');
    const user = users[0];
    user.profile_image = resolveUrl(user.profile_image);
    socials.forEach(s => { user[s.platform.toLowerCase()] = s.url; });
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// PUT /api/auth/profile
// -----------------------------------------------------------
// Update the logged-in user's profile info.
//
// HEADERS: Authorization: Bearer <token>
// BODY: { "name": "New Name", "email": "new@email.com", "profile_image": "..." }
// -----------------------------------------------------------
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, profile_image } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    console.log('Profile update attempt:', { name, email, userId: req.user.id });
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, profile_image = ? WHERE id = ?',
      [name, email, profile_image || null, req.user.id]
    );
    console.log('Profile updated successfully');

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// -----------------------------------------------------------
// PUT /api/auth/change-password
// -----------------------------------------------------------
// Change the logged-in user's password.
//
// HEADERS: Authorization: Bearer <token>
// BODY: { "currentPassword": "admin123", "newPassword": "newpass123" }
// -----------------------------------------------------------
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify current password is correct
    const [users] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const validPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
