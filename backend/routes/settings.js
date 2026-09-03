import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken as auth } from '../middleware/auth.js';
import BACKEND_URL from '../helpers/backendUrl.js';

function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }

function upsertSetting(key, value) {
  const [existing] = pool.execute('SELECT key FROM site_settings WHERE key = ?', [key]);
  if (existing.length > 0) {
    pool.execute('UPDATE site_settings SET value = ?, updated_at = datetime(\'now\') WHERE key = ?', [value, key]);
  } else {
    pool.execute('INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))', [key, value]);
  }
}

const router = Router();

const getAllSettings = (req, res) => {
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
};

const updateSettings = (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      upsertSetting(key, String(value));
    }
    pool.flush();
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

router.get('/', getAllSettings);
router.get('/all', auth, getAllSettings);
router.get('/global', auth, getAllSettings);
router.put('/', auth, updateSettings);
router.put('/global', auth, updateSettings);

export default router;
