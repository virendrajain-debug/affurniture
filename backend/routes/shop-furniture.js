import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM shop_furniture ORDER BY id DESC LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Get shop furniture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const [existing] = await pool.execute('SELECT id FROM shop_furniture LIMIT 1');
    if (existing.length > 0) {
      await pool.execute('UPDATE shop_furniture SET content = ? WHERE id = ?', [content, existing[0].id]);
    } else {
      await pool.execute('INSERT INTO shop_furniture (content) VALUES (?)', [content]);
    }
    res.json({ message: 'Shop Furniture updated' });
  } catch (error) {
    console.error('Update shop furniture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
