import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM about ORDER BY id DESC LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error('Get about error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const fields = ['company_name', 'tagline', 'description', 'image_1', 'image_2', 'address', 'phone', 'email'];
    const updates = {};
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const [existing] = await pool.execute('SELECT id FROM about LIMIT 1');
    if (existing.length > 0) {
      const setClauses = Object.keys(updates).map(k => `${k}=?`).join(', ');
      if (setClauses) {
        const vals = [...Object.values(updates), existing[0].id];
        await pool.execute(`UPDATE about SET ${setClauses} WHERE id=?`, vals);
      }
    } else {
      const cols = Object.keys(updates);
      const placeholders = cols.map(() => '?').join(', ');
      const vals = Object.values(updates);
      await pool.execute(`INSERT INTO about (${cols.join(', ')}) VALUES (${placeholders})`, vals);
    }

    if (pool.flush) pool.flush();

    res.json({ message: 'About info updated' });
  } catch (error) {
    console.error('Update about error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
