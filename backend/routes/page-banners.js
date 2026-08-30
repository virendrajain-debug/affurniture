import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM page_banners ORDER BY id ASC');
    res.json(rows.map(r => ({ ...r, image: resolveUrl(r.image) })));
  } catch (err) {
    console.error('Get page banners error:', err);
    res.status(500).json({ message: 'Failed to fetch page banners' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { page_key, label, image } = req.body;
    if (!page_key || !page_key.trim()) {
      return res.status(400).json({ message: 'Page key is required' });
    }
    const result = await pool.execute(
      'INSERT INTO page_banners (page_key, label, image) VALUES (?, ?, ?)',
      [page_key.trim(), label || page_key.trim(), image || '']
    );
    res.json({ message: 'Page banner created', id: result.insertId });
  } catch (err) {
    console.error('Create page banner error:', err);
    res.status(500).json({ message: 'Failed to create page banner' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { page_key, label, image } = req.body;
    await pool.execute(
      'UPDATE page_banners SET page_key=?, label=?, image=? WHERE id=?',
      [page_key, label, image || '', req.params.id]
    );
    res.json({ message: 'Page banner updated' });
  } catch (err) {
    console.error('Update page banner error:', err);
    res.status(500).json({ message: 'Failed to update page banner' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM page_banners WHERE id=?', [req.params.id]);
    res.json({ message: 'Page banner deleted' });
  } catch (err) {
    console.error('Delete page banner error:', err);
    res.status(500).json({ message: 'Failed to delete page banner' });
  }
});

router.put('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM page_banners WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Toggled', banner: rows[0] });
  } catch (err) {
    console.error('Toggle page banner error:', err);
    res.status(500).json({ message: 'Failed to toggle page banner' });
  }
});

export default router;
