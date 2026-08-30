import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendWinzEmail } from '../helpers/email.js';

const router = Router();

// Public: submit a winz quote request
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, product_name, message } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const [result] = await pool.execute(
      'INSERT INTO winz_quotes (name, email, phone, product_name, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, product_name || null, message || null]
    );
    sendWinzEmail({ name, email, phone, product_name, message }).catch(() => {});
    res.status(201).json({ message: 'Quote request submitted successfully', id: result.insertId });
  } catch (error) {
    console.error('Winz quote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: get all winz quotes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM winz_quotes ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get winz quotes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: mark a winz quote as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.execute("UPDATE winz_quotes SET status = 'read' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: delete a winz quote
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM winz_quotes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Quote deleted' });
  } catch (error) {
    console.error('Delete winz quote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
