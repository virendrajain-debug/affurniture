import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

function upsertSetting(key, value) {
  const [existing] = pool.execute('SELECT key FROM site_settings WHERE key = ?', [key]);
  if (existing.length > 0) {
    pool.execute('UPDATE site_settings SET value = ?, updated_at = datetime(\'now\') WHERE key = ?', [value, key]);
  } else {
    pool.execute('INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))', [key, value]);
  }
}

const router = Router();

router.get('/', (req, res) => {
  try {
    const [rows] = pool.execute("SELECT value FROM site_settings WHERE key = 'deals'");
    if (rows.length > 0) {
      try { res.json(JSON.parse(rows[0].value)); } catch { res.json({}); }
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Get deals error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', authenticateToken, (req, res) => {
  try {
    const value = JSON.stringify(req.body);
    upsertSetting('deals', value);
    pool.flush();
    res.json({ message: 'Deals updated successfully' });
  } catch (error) {
    console.error('Update deals error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
