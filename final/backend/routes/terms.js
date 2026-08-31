// Terms & Conditions API Routes
// Manages the Terms content:
//   GET  /api/terms  - Get terms content (public)
//   PUT  /api/terms  - Update terms content (protected)

import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/terms - Get terms content (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM terms ORDER BY id DESC LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/terms - Update terms content (PROTECTED)
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const [existing] = await pool.execute('SELECT id FROM terms LIMIT 1');
    if (existing.length > 0) {
      await pool.execute('UPDATE terms SET content = ? WHERE id = ?', [content, existing[0].id]);
    } else {
      await pool.execute('INSERT INTO terms (content) VALUES (?)', [content]);
    }
    res.json({ message: 'Terms & Conditions updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
