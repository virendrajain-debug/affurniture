import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

import BACKEND_URL from '../helpers/backendUrl.js';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, active } = req.query;
    let sql = 'SELECT * FROM dynamic_pages WHERE 1=1';
    const params = [];
    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (active === 'true') { sql += ' AND active = 1'; }
    sql += ' ORDER BY sort_order ASC, title ASC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows.map(r => ({ ...r, banner_image: resolveUrl(r.banner_image) })));
  } catch (err) {
    console.error('Get dynamic pages error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT DISTINCT category FROM dynamic_pages ORDER BY category ASC');
    res.json(rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM dynamic_pages WHERE slug = ? AND active = 1', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ message: 'Page not found' });
    const page = rows[0];
    page.banner_image = resolveUrl(page.banner_image);
    res.json(page);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/id/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM dynamic_pages WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Page not found' });
    const page = rows[0];
    page.banner_image = resolveUrl(page.banner_image);
    res.json(page);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { slug, title, category, content, banner_image, meta_description, sort_order, active } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const pageSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const [existing] = await pool.execute('SELECT id FROM dynamic_pages WHERE slug = ?', [pageSlug]);
    if (existing.length > 0) return res.status(400).json({ message: 'A page with this slug already exists' });

    const [result] = await pool.execute(
      'INSERT INTO dynamic_pages (slug, title, category, content, banner_image, meta_description, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [pageSlug, title, category || 'General', content || '', banner_image || '', meta_description || '', sort_order || 0, active !== undefined ? (active ? 1 : 0) : 1]
    );
    res.status(201).json({ message: 'Page created', id: result.insertId, slug: pageSlug });
  } catch (err) {
    console.error('Create dynamic page error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { slug, title, category, content, banner_image, meta_description, sort_order, active } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const pageSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const [dupCheck] = await pool.execute('SELECT id FROM dynamic_pages WHERE slug = ? AND id != ?', [pageSlug, req.params.id]);
    if (dupCheck.length > 0) return res.status(400).json({ message: 'Slug already in use' });

    await pool.execute(
      'UPDATE dynamic_pages SET slug=?, title=?, category=?, content=?, banner_image=?, meta_description=?, sort_order=?, active=?, updated_at=datetime(\'now\') WHERE id=?',
      [pageSlug, title, category || 'General', content || '', banner_image || '', meta_description || '', sort_order || 0, active !== undefined ? (active ? 1 : 0) : 1, req.params.id]
    );
    res.json({ message: 'Page updated' });
  } catch (err) {
    console.error('Update dynamic page error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM dynamic_pages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
