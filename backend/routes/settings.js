import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = pool.execute('SELECT key, value FROM site_settings');
    const settings = {};
    rows.forEach(r => {
      const val = r.value;
      settings[r.key] = (val && val.startsWith('/uploads/')) ? resolveUrl(val) : val;
    });
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

router.get('/all', auth, async (req, res) => {
  try {
    const [rows] = pool.execute('SELECT key, value FROM site_settings');
    const settings = {};
    rows.forEach(r => {
      const val = r.value;
      settings[r.key] = (val && val.startsWith('/uploads/')) ? resolveUrl(val) : val;
    });
    res.json(settings);
  } catch (err) {
    console.error('Get all settings error:', err);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      pool.execute(
        'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime(\'now\')',
        [key, value, value]
      );
    }
    res.json({ message: 'Settings updated' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

export default router;
