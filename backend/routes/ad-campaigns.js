import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { position, active_only } = req.query;
    let sql = 'SELECT * FROM ad_campaigns';
    const params = [];
    const conditions = [];
    if (position) { conditions.push('position = ?'); params.push(position); }
    if (active_only === 'true') { conditions.push('active = 1'); }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY sort_order ASC, id DESC';
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Get ad campaigns error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, image, link, position, sort_order, active } = req.body;
    if (!name || !image) return res.status(400).json({ message: 'Name and image are required' });
    const [result] = await pool.execute(
      'INSERT INTO ad_campaigns (name, image, link, position, sort_order, active) VALUES (?, ?, ?, ?, ?, ?)',
      [name, image, link || '', position || 'homepage', sort_order || 0, active !== undefined ? active : 1]
    );
    res.status(201).json({ message: 'Campaign created', id: result.insertId });
  } catch (error) {
    console.error('Create ad campaign error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, image, link, position, sort_order, active } = req.body;
    await pool.execute(
      'UPDATE ad_campaigns SET name = ?, image = ?, link = ?, position = ?, sort_order = ?, active = ? WHERE id = ?',
      [name, image, link || '', position || 'homepage', sort_order || 0, active !== undefined ? active : 1, req.params.id]
    );
    res.json({ message: 'Campaign updated' });
  } catch (error) {
    console.error('Update ad campaign error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM ad_campaigns WHERE id = ?', [req.params.id]);
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    console.error('Delete ad campaign error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
