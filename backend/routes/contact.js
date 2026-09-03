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
    const keys = ['contact_email', 'contact_phone', 'contact_address', 'contact_whatsapp'];
    const placeholders = keys.map(() => '?').join(',');
    const [rows] = pool.execute(`SELECT key, value FROM site_settings WHERE key IN (${placeholders})`, keys);
    const data = {};
    rows.forEach(r => { data[r.key.replace('contact_', '')] = r.value; });
    res.json(data);
  } catch (err) {
    console.error('Get contact error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', authenticateToken, (req, res) => {
  try {
    const { email, phone, address, whatsapp } = req.body;
    const entries = [
      ['contact_email', email],
      ['contact_phone', phone],
      ['contact_address', address],
      ['contact_whatsapp', whatsapp],
    ];
    for (const [key, value] of entries) {
      if (value !== undefined) {
        upsertSetting(key, value || '');
      }
    }
    res.json({ message: 'Contact info updated' });
  } catch (err) {
    console.error('Update contact error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
