import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public: get privacy policy
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM privacy_policy ORDER BY id DESC LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Get privacy policy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: update privacy policy
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const [existing] = await pool.execute('SELECT id FROM privacy_policy LIMIT 1');
    if (existing.length > 0) {
      await pool.execute('UPDATE privacy_policy SET content = ? WHERE id = ?', [content, existing[0].id]);
    } else {
      await pool.execute('INSERT INTO privacy_policy (content) VALUES (?)', [content]);
    }
    res.json({ message: 'Privacy Policy updated' });
  } catch (error) {
    console.error('Update privacy policy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
