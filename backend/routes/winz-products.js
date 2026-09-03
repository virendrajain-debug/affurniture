import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken as auth } from '../middleware/auth.js';
import BACKEND_URL from '../helpers/backendUrl.js';

function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM winz_products WHERE 1=1';
    const params = [];
    if (req.query.active_only === 'true') { sql += ' AND active = 1'; }
    if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }
    sql += ' ORDER BY sort_order ASC, id DESC';
    const [rows] = await pool.execute(sql, params);
    rows.forEach(r => { if (r.image) r.image = resolveUrl(r.image); });
    res.json(rows);
  } catch (err) {
    console.error('Get winz products error:', err);
    res.status(500).json({ message: 'Failed to fetch WinZ products' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, category, item_code, price, image, description, active } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO winz_products (name, category, item_code, price, image, description, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, category || '', item_code || '', price || 0, image || '', description || '', active !== undefined ? active : 1]
    );
    res.json({ id: result.lastInsertRowid, message: 'WinZ product created' });
  } catch (err) {
    console.error('Create winz product error:', err);
    res.status(500).json({ message: 'Failed to create WinZ product' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, category, item_code, price, image, description, active } = req.body;
    await pool.execute(
      'UPDATE winz_products SET name=?, category=?, item_code=?, price=?, image=?, description=?, active=? WHERE id=?',
      [name, category || '', item_code || '', price || 0, image || '', description || '', active !== undefined ? active : 1, req.params.id]
    );
    res.json({ message: 'WinZ product updated' });
  } catch (err) {
    console.error('Update winz product error:', err);
    res.status(500).json({ message: 'Failed to update WinZ product' });
  }
});

router.put('/:id/toggle', auth, async (req, res) => {
  try {
    await pool.execute('UPDATE winz_products SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?', [req.params.id]);
    res.json({ message: 'Status toggled' });
  } catch (err) {
    console.error('Toggle winz product error:', err);
    res.status(500).json({ message: 'Failed to toggle status' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.execute('DELETE FROM winz_products WHERE id = ?', [req.params.id]);
    res.json({ message: 'WinZ product deleted' });
  } catch (err) {
    console.error('Delete winz product error:', err);
    res.status(500).json({ message: 'Failed to delete WinZ product' });
  }
});

export default router;
