import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = pool.execute('SELECT * FROM social_links WHERE enabled = 1 ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    console.error('Get social links error:', err);
    res.status(500).json({ message: 'Failed to fetch social links' });
  }
});

router.get('/all', auth, async (req, res) => {
  try {
    const [rows] = pool.execute('SELECT * FROM social_links ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    console.error('Get all social links error:', err);
    res.status(500).json({ message: 'Failed to fetch social links' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { platform, url, icon, sort_order, enabled } = req.body;
    if (!platform || !url) {
      return res.status(400).json({ message: 'Platform and URL are required' });
    }
    pool.execute(
      'INSERT INTO social_links (platform, url, icon, sort_order, enabled) VALUES (?, ?, ?, ?, ?)',
      [platform, url, icon || platform.toLowerCase(), sort_order || 0, enabled !== undefined ? (enabled ? 1 : 0) : 1]
    );
    res.status(201).json({ message: 'Social link created' });
  } catch (err) {
    console.error('Create social link error:', err);
    res.status(500).json({ message: 'Failed to create social link' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { platform, url, icon, sort_order, enabled } = req.body;
    const { id } = req.params;
    pool.execute(
      'UPDATE social_links SET platform = ?, url = ?, icon = ?, sort_order = ?, enabled = ? WHERE id = ?',
      [platform, url, icon || platform.toLowerCase(), sort_order || 0, enabled ? 1 : 0, id]
    );
    res.json({ message: 'Social link updated' });
  } catch (err) {
    console.error('Update social link error:', err);
    res.status(500).json({ message: 'Failed to update social link' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    pool.execute('DELETE FROM social_links WHERE id = ?', [id]);
    res.json({ message: 'Social link deleted' });
  } catch (err) {
    console.error('Delete social link error:', err);
    res.status(500).json({ message: 'Failed to delete social link' });
  }
});

export default router;
