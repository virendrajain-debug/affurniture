import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM site_settings WHERE `key` = 'homepage'");
    if (rows.length > 0) {
      try { res.json(JSON.parse(rows[0].value)); } catch { res.json({}); }
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Get homepage error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const [existing] = await pool.execute("SELECT id FROM site_settings WHERE `key` = 'homepage'");
    if (existing.length > 0) {
      await pool.execute("UPDATE site_settings SET `value` = ? WHERE `key` = 'homepage'", [JSON.stringify(req.body)]);
    } else {
      await pool.execute("INSERT INTO site_settings (`key`, `value`) VALUES (?, ?)", ['homepage', JSON.stringify(req.body)]);
    }
    res.json({ message: 'Homepage updated' });
  } catch (error) {
    console.error('Update homepage error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
