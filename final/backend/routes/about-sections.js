import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM about_sections ORDER BY id ASC');
    res.json(rows.map(r => ({ ...r, image: resolveUrl(r.image) })));
  } catch (err) {
    console.error('Get about sections error:', err);
    res.status(500).json({ message: 'Failed to fetch about sections' });
  }
});

router.get('/:type', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM about_sections WHERE type=? LIMIT 1', [req.params.type]);
    const row = rows[0] || {};
    if (row.image) row.image = resolveUrl(row.image);
    res.json(row);
  } catch (err) {
    console.error('Get about section error:', err);
    res.status(500).json({ message: 'Failed to fetch about section' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, title, description, image } = req.body;
    const [existing] = await pool.execute('SELECT id FROM about_sections WHERE type=?', [type]);
    if (existing.length > 0) {
      await pool.execute(
        'UPDATE about_sections SET title=?, description=?, image=?, updated_at=datetime(\'now\') WHERE type=?',
        [title || '', description || '', image || '', type]
      );
      res.json({ message: 'About section updated' });
    } else {
      const result = await pool.execute(
        'INSERT INTO about_sections (type, title, description, image) VALUES (?, ?, ?, ?)',
        [type, title || '', description || '', image || '']
      );
      res.json({ message: 'About section created', id: result.insertId });
    }
  } catch (err) {
    console.error('Save about section error:', err);
    res.status(500).json({ message: 'Failed to save about section' });
  }
});

router.put('/:type', authenticateToken, async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const [existing] = await pool.execute('SELECT id FROM about_sections WHERE type=?', [req.params.type]);
    if (existing.length > 0) {
      await pool.execute(
        'UPDATE about_sections SET title=?, description=?, image=?, updated_at=datetime(\'now\') WHERE type=?',
        [title || '', description || '', image || '', req.params.type]
      );
    } else {
      await pool.execute(
        'INSERT INTO about_sections (type, title, description, image) VALUES (?, ?, ?, ?)',
        [req.params.type, title || '', description || '', image || '']
      );
    }
    res.json({ message: 'About section saved' });
  } catch (err) {
    console.error('Update about section error:', err);
    res.status(500).json({ message: 'Failed to update about section' });
  }
});

export default router;
