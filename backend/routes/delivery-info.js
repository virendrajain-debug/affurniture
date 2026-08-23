import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM delivery_info ORDER BY id DESC LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Get delivery info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const [existing] = await pool.execute('SELECT id FROM delivery_info LIMIT 1');
    if (existing.length > 0) {
      await pool.execute('UPDATE delivery_info SET content = ? WHERE id = ?', [content, existing[0].id]);
    } else {
      await pool.execute('INSERT INTO delivery_info (content) VALUES (?)', [content]);
    }
    res.json({ message: 'Delivery Info updated' });
  } catch (error) {
    console.error('Update delivery info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
