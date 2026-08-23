import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM returns ORDER BY id DESC LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Get returns error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const [existing] = await pool.execute('SELECT id FROM returns LIMIT 1');
    if (existing.length > 0) {
      await pool.execute('UPDATE returns SET content = ? WHERE id = ?', [content, existing[0].id]);
    } else {
      await pool.execute('INSERT INTO returns (content) VALUES (?)', [content]);
    }
    res.json({ message: 'Returns updated' });
  } catch (error) {
    console.error('Update returns error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
