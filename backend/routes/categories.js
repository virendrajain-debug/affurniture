import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.execute(`
      SELECT c.*, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      GROUP BY c.id 
      ORDER BY c.sort_order ASC, c.name ASC
    `);

    const [subcategories] = await pool.execute(`
      SELECT s.*, COUNT(p.id) as product_count
      FROM subcategories s
      LEFT JOIN products p ON s.id = p.subcategory_id
      GROUP BY s.id
      ORDER BY s.sort_order ASC, s.name ASC
    `);

    const result = categories.map(cat => ({
      ...cat,
      subcategories: subcategories.filter(s => String(s.category_id) === String(cat.id)),
    }));

    res.json(result);
  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, image, sort_order } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const [existing] = await pool.execute('SELECT id FROM categories WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const [maxOrder] = await pool.execute('SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM categories');
    const order = sort_order ?? maxOrder[0].next_order;

    const [result] = await pool.execute(
      'INSERT INTO categories (name, image, sort_order) VALUES (?, ?, ?)',
      [name, image || '', order]
    );
    res.status(201).json({ message: 'Category created', id: result.insertId, name, image: image || '', sort_order: order });
  } catch (error) {
    console.error('Create category error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, image, sort_order } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const [existing] = await pool.execute('SELECT id FROM categories WHERE name = ? AND id != ?', [name, req.params.id]);
    if (existing.length > 0) return res.status(400).json({ message: 'Category name already exists' });

    if (sort_order !== undefined) {
      await pool.execute('UPDATE categories SET name = ?, image = ?, sort_order = ? WHERE id = ?', [name, image || '', sort_order, req.params.id]);
    } else {
      await pool.execute('UPDATE categories SET name = ?, image = ? WHERE id = ?', [name, image || '', req.params.id]);
    }
    res.json({ message: 'Category updated' });
  } catch (error) {
    console.error('Update category error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/reorder', authenticateToken, async (req, res) => {
  try {
    const { sort_order } = req.body;
    if (sort_order === undefined) return res.status(400).json({ message: 'sort_order is required' });
    await pool.execute('UPDATE categories SET sort_order = ? WHERE id = ?', [sort_order, req.params.id]);
    res.json({ message: 'Category reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
