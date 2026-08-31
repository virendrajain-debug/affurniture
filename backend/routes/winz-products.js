import { Router } from 'express';
import pool from '../config/db.js';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }

const router = Router();

// GET /api/winz-products - List all WINZ products
router.get('/', async (req, res) => {
  try {
    const { category, active_only, search } = req.query;
    let sql = 'SELECT * FROM winz_products';
    const conditions = [];
    const params = [];

    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }
    if (active_only === 'true') {
      conditions.push('active = 1');
    }
    if (search && search.trim()) {
      conditions.push('(name LIKE ? OR item_code LIKE ? OR description LIKE ?)');
      const q = `%${search.trim()}%`;
      params.push(q, q, q);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY sort_order ASC, id DESC';

    const [rows] = await pool.execute(sql, params);
    res.json(rows.map(r => ({ ...r, image: resolveUrl(r.image) })));
  } catch (err) {
    console.error('Get winz products error:', err);
    res.status(500).json({ message: 'Failed to fetch WinZ products' });
  }
});

// GET /api/winz-products/:id - Single WINZ product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM winz_products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ ...rows[0], image: resolveUrl(rows[0].image) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// POST /api/winz-products - Create new WINZ product
router.post('/', async (req, res) => {
  try {
    const { name, category, item_code, price, image, description, sort_order, active } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Product name is required' });

    const [result] = await pool.execute(
      'INSERT INTO winz_products (name, category, item_code, price, image, description, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name.trim(),
        category || 'Living Room',
        item_code || '',
        price ? Number(price) : 0,
        image ? image.trim() : '',
        description || '',
        sort_order ? Number(sort_order) : 0,
        active !== undefined ? (active ? 1 : 0) : 1
      ]
    );

    res.status(201).json({ message: 'WinZ product created', id: result.insertId });
  } catch (err) {
    console.error('Create winz product error:', err);
    res.status(500).json({ message: 'Failed to create WinZ product' });
  }
});

// PUT /api/winz-products/:id - Update WINZ product
router.put('/:id', async (req, res) => {
  try {
    const { name, category, item_code, price, image, description, sort_order, active } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Product name is required' });

    await pool.execute(
      'UPDATE winz_products SET name = ?, category = ?, item_code = ?, price = ?, image = ?, description = ?, sort_order = ?, active = ? WHERE id = ?',
      [
        name.trim(),
        category || 'Living Room',
        item_code || '',
        price ? Number(price) : 0,
        image ? image.trim() : '',
        description || '',
        sort_order ? Number(sort_order) : 0,
        active !== undefined ? (active ? 1 : 0) : 1,
        req.params.id
      ]
    );

    res.json({ message: 'WinZ product updated' });
  } catch (err) {
    console.error('Update winz product error:', err);
    res.status(500).json({ message: 'Failed to update WinZ product' });
  }
});

// PUT /api/winz-products/:id/toggle - Toggle active status
router.put('/:id/toggle', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT active FROM winz_products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });

    const newActive = rows[0].active === 1 ? 0 : 1;
    await pool.execute('UPDATE winz_products SET active = ? WHERE id = ?', [newActive, req.params.id]);
    res.json({ message: 'Status updated', active: newActive });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle status' });
  }
});

// DELETE /api/winz-products/:id - Delete WINZ product
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM winz_products WHERE id = ?', [req.params.id]);
    res.json({ message: 'WinZ product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;
