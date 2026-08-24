import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public: get all active store locations
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM store_locations WHERE active = 1 ORDER BY sort_order ASC');
    res.json(rows);
  } catch (error) {
    console.error('Get store locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: get all store locations (including inactive)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM store_locations ORDER BY sort_order ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: create store location
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, address, city, phone, email, google_map_url, latitude, longitude, description, sort_order } = req.body;
    if (!name) return res.status(400).json({ message: 'Location name is required' });
    const [result] = await pool.execute(
      'INSERT INTO store_locations (name, address, city, phone, email, google_map_url, latitude, longitude, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, address || null, city || null, phone || null, email || null, google_map_url || null, latitude || null, longitude || null, description || null, sort_order || 0]
    );
    res.status(201).json({ message: 'Store location created', id: result.insertId });
  } catch (error) {
    console.error('Create store location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: update store location
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, address, city, phone, email, google_map_url, latitude, longitude, description, sort_order, active } = req.body;
    await pool.execute(
      'UPDATE store_locations SET name=?, address=?, city=?, phone=?, email=?, google_map_url=?, latitude=?, longitude=?, description=?, sort_order=?, active=? WHERE id=?',
      [name, address || null, city || null, phone || null, email || null, google_map_url || null, latitude || null, longitude || null, description || null, sort_order || 0, active !== undefined ? active : 1, req.params.id]
    );
    res.json({ message: 'Store location updated' });
  } catch (error) {
    console.error('Update store location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: delete store location
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM store_locations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Store location deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
