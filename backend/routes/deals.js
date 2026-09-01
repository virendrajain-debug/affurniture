import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }

// GET /api/deals - public endpoint
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM site_settings WHERE setting_key = 'deals'");
    if (rows.length > 0) {
      const val = rows[0].setting_value;
      try { res.json(JSON.parse(val)); } catch { res.json({}); }
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Get deals error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/deals - protected
router.put('/', authenticateToken, async (req, res) => {
  try {
    const [existing] = await pool.execute("SELECT id FROM site_settings WHERE setting_key = 'deals'");
    if (existing.length > 0) {
      await pool.execute("UPDATE site_settings SET setting_value = ? WHERE setting_key = 'deals'", [JSON.stringify(req.body)]);
    } else {
      await pool.execute("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)", ['deals', JSON.stringify(req.body)]);
    }
    res.json({ message: 'Deals updated' });
  } catch (error) {
    console.error('Update deals error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
