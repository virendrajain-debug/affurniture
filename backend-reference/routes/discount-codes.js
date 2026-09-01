import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM discount_codes ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Get discount codes error:', err);
    res.status(500).json({ message: 'Failed to fetch discount codes' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { code, value, type, min_order, max_uses, expires_at } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Discount code is required' });
    }
    const result = await pool.execute(
      'INSERT INTO discount_codes (code, value, type, min_order, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [code.toUpperCase(), value || '10%', type || 'percentage', min_order || 0, max_uses || 0, expires_at || null]
    );
    res.json({ message: 'Discount code created', id: result.insertId });
  } catch (err) {
    console.error('Create discount code error:', err);
    res.status(500).json({ message: 'Failed to create discount code' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { code, value, type, min_order, max_uses, expires_at, active } = req.body;
    await pool.execute(
      'UPDATE discount_codes SET code=?, value=?, type=?, min_order=?, max_uses=?, expires_at=?, active=? WHERE id=?',
      [code.toUpperCase(), value, type, min_order || 0, max_uses || 0, expires_at || null, active !== undefined ? (active ? 1 : 0) : 1, req.params.id]
    );
    res.json({ message: 'Discount code updated' });
  } catch (err) {
    console.error('Update discount code error:', err);
    res.status(500).json({ message: 'Failed to update discount code' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM discount_codes WHERE id=?', [req.params.id]);
    res.json({ message: 'Discount code deleted' });
  } catch (err) {
    console.error('Delete discount code error:', err);
    res.status(500).json({ message: 'Failed to delete discount code' });
  }
});

export default router;
