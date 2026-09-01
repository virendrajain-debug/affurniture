// Unified page content route for the PageEditor in admin panel.
// Maps page keys to their respective database tables:
//   home, contact         -> site_settings (banner_image)
//   delivery-info         -> delivery_info table
//   returns               -> returns table
//   terms                 -> terms table
//   privacy-policy        -> privacy_policy table
//   shop-furniture        -> shop_furniture table

import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }

const TABLE_MAP = {
  'delivery-info': 'delivery_info',
  'returns': 'returns',
  'terms': 'terms',
  'privacy-policy': 'privacy_policy',
  'shop-furniture': 'shop_furniture',
};

const router = Router();

// GET /api/pages/:pageKey
router.get('/:pageKey', async (req, res) => {
  try {
    const { pageKey } = req.params;

    if (pageKey === 'home' || pageKey === 'contact') {
      const [rows] = await pool.execute('SELECT value FROM site_settings WHERE key = ?', [`page_${pageKey}_banner`]);
      const banner_image = rows.length > 0 ? resolveUrl(rows[0].value) : '';
      return res.json({ page_key: pageKey, banner_image });
    }

    const table = TABLE_MAP[pageKey];
    if (!table) return res.status(404).json({ message: 'Page not found' });

    const [rows] = await pool.execute(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 1`);
    const data = rows[0] || {};
    if (data.banner_image) data.banner_image = resolveUrl(data.banner_image);
    res.json(data);
  } catch (error) {
    console.error('Get page error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/pages/:pageKey
router.put('/:pageKey', authenticateToken, async (req, res) => {
  try {
    const { pageKey } = req.params;
    const { content, banner_image } = req.body;

    if (pageKey === 'home' || pageKey === 'contact') {
      const key = `page_${pageKey}_banner`;
      const val = banner_image || '';
      await pool.execute(
        'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime(\'now\')',
        [key, val, val]
      );
      return res.json({ message: 'Page updated' });
    }

    const table = TABLE_MAP[pageKey];
    if (!table) return res.status(404).json({ message: 'Page not found' });

    const [existing] = await pool.execute(`SELECT id FROM ${table} LIMIT 1`);
    if (existing.length > 0) {
      await pool.execute(`UPDATE ${table} SET content = ?, banner_image = ? WHERE id = ?`, [content || '', banner_image || '', existing[0].id]);
    } else {
      await pool.execute(`INSERT INTO ${table} (content, banner_image) VALUES (?, ?)`, [content || '', banner_image || '']);
    }
    res.json({ message: 'Page updated' });
  } catch (error) {
    console.error('Update page error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
