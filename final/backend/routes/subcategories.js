import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;
    let sql = `
      SELECT s.*, c.name as category_name, COUNT(p.id) as product_count
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN products p ON s.id = p.subcategory_id
    `;
    const params = [];
    if (category_id) {
      sql += ' WHERE s.category_id = ?';
      params.push(category_id);
    }
    sql += ' GROUP BY s.id ORDER BY s.sort_order ASC, s.name ASC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Get subcategories error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, category_id, sort_order } = req.body;
    if (!name || !category_id) return res.status(400).json({ message: 'Name and category are required' });

    const [existing] = await pool.execute('SELECT id FROM subcategories WHERE name = ? AND category_id = ?', [name, category_id]);
    if (existing.length > 0) return res.status(400).json({ message: 'Subcategory already exists in this category' });

    const [maxOrder] = await pool.execute('SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM subcategories WHERE category_id = ?', [category_id]);
    const order = sort_order ?? maxOrder[0].next_order;

    const [result] = await pool.execute(
      'INSERT INTO subcategories (name, category_id, sort_order) VALUES (?, ?, ?)',
      [name, category_id, order]
    );
    res.status(201).json({ message: 'Subcategory created', id: result.insertId, name, category_id, sort_order: order });
  } catch (error) {
    console.error('Create subcategory error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, category_id, sort_order } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    if (sort_order !== undefined) {
      await pool.execute('UPDATE subcategories SET name = ?, category_id = ?, sort_order = ? WHERE id = ?', [name, category_id, sort_order, req.params.id]);
    } else {
      await pool.execute('UPDATE subcategories SET name = ?, category_id = ? WHERE id = ?', [name, category_id, req.params.id]);
    }
    res.json({ message: 'Subcategory updated' });
  } catch (error) {
    console.error('Update subcategory error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/reorder', authenticateToken, async (req, res) => {
  try {
    const { sort_order } = req.body;
    if (sort_order === undefined) return res.status(400).json({ message: 'sort_order is required' });
    await pool.execute('UPDATE subcategories SET sort_order = ? WHERE id = ?', [sort_order, req.params.id]);
    res.json({ message: 'Subcategory reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM subcategories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Subcategory deleted' });
  } catch (error) {
    console.error('Delete subcategory error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
