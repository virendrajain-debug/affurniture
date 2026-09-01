// Contact Info API Route
// Simple key-value store for contact information (email, phone, address, whatsapp)
// Used by the admin Contact.jsx page

import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/contact - public
router.get('/', async (req, res) => {
  try {
    const keys = ['contact_email', 'contact_phone', 'contact_address', 'contact_whatsapp'];
    const [rows] = await pool.execute('SELECT key, value FROM site_settings WHERE key IN (' + keys.map(() => '?').join(',') + ')', keys);
    const data = {};
    rows.forEach(r => { data[r.key.replace('contact_', '')] = r.value; });
    res.json(data);
  } catch (err) {
    console.error('Get contact error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/contact - protected
router.put('/', authenticateToken, async (req, res) => {
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
        await pool.execute(
          'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime(\'now\')',
          [key, value || '', value || '']
        );
      }
    }
    res.json({ message: 'Contact info updated' });
  } catch (err) {
    console.error('Update contact error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
