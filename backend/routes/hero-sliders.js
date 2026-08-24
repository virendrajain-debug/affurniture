import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM hero_sliders ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Get hero sliders error:', err);
    res.status(500).json({ message: 'Failed to fetch hero sliders' });
  }
});

router.get('/active', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM hero_sliders WHERE active = 1 ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Get active hero sliders error:', err);
    res.status(500).json({ message: 'Failed to fetch active hero sliders' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { image, alt, tagline, title, description, sort_order, active } = req.body;
    const result = await pool.execute(
      'INSERT INTO hero_sliders (image, alt, tagline, title, description, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [image || '', alt || '', tagline || '', title || '', description || '', sort_order || 0, active !== undefined ? (active ? 1 : 0) : 1]
    );
    res.json({ message: 'Hero slider created', id: result.insertId });
  } catch (err) {
    console.error('Create hero slider error:', err);
    res.status(500).json({ message: 'Failed to create hero slider' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { image, alt, tagline, title, description, sort_order, active } = req.body;
    await pool.execute(
      'UPDATE hero_sliders SET image=?, alt=?, tagline=?, title=?, description=?, sort_order=?, active=? WHERE id=?',
      [image || '', alt || '', tagline || '', title || '', description || '', sort_order || 0, active !== undefined ? (active ? 1 : 0) : 1, req.params.id]
    );
    res.json({ message: 'Hero slider updated' });
  } catch (err) {
    console.error('Update hero slider error:', err);
    res.status(500).json({ message: 'Failed to update hero slider' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM hero_sliders WHERE id=?', [req.params.id]);
    res.json({ message: 'Hero slider deleted' });
  } catch (err) {
    console.error('Delete hero slider error:', err);
    res.status(500).json({ message: 'Failed to delete hero slider' });
  }
});

export default router;
