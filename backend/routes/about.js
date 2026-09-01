// ============================================================
// About Page API Routes
// ============================================================
// Manages company information for the About section:
//   GET  /api/about  - Get company info (public)
//   PUT  /api/about  - Update company info (protected)
// ============================================================

import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// -----------------------------------------------------------
// GET /api/about
// -----------------------------------------------------------
// Get the company's about information. PUBLIC endpoint.
//
// RESPONSE:
//   { "company_name": "AF Furnishings", "tagline": "...", "description": "...", ... }
// -----------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM about ORDER BY id DESC LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// PUT /api/about
// -----------------------------------------------------------
// Update the company's about information. REQUIRES AUTHENTICATION.
//
// HEADERS: Authorization: Bearer <token>
// BODY: { "company_name": "AF Furnishings", "tagline": "...", "description": "...", "address": "...", "phone": "...", "email": "..." }
// -----------------------------------------------------------
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { company_name, tagline, description, address, phone, email } = req.body;

    // Check if about record exists (update) or create new
    const [existing] = await pool.execute('SELECT id FROM about LIMIT 1');
    if (existing.length > 0) {
      await pool.execute(
        'UPDATE about SET company_name=?, tagline=?, description=?, address=?, phone=?, email=? WHERE id=?',
        [company_name, tagline, description, address, phone, email, existing[0].id]
      );
    } else {
      await pool.execute(
        'INSERT INTO about (company_name, tagline, description, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
        [company_name, tagline, description, address, phone, email]
      );
    }

    res.json({ message: 'About info updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
