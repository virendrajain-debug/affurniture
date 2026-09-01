import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/deals - Get deals section content
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT value FROM site_settings WHERE key = 'homepage_deals'");
    if (rows.length > 0 && rows[0].value) {
      try {
        return res.json(JSON.parse(rows[0].value));
      } catch {}
    }
    // Default deals data
    res.json({
      title: 'Limited-Time Weekly Deals',
      subtitle: 'Comfortable furniture at straightforward prices. Flexible weekly payments available.',
      items: [
        {
          id: 1,
          icon: 'delivery',
          title: 'NZ Wide Delivery',
          description: 'Fast and reliable delivery to your doorstep anywhere in New Zealand.',
        },
        {
          id: 2,
          icon: 'payment',
          title: 'Easy Weekly Payment Plans',
          description: 'Spread the cost with simple weekly instalments that suit your budget.',
        },
        {
          id: 3,
          icon: 'shield',
          title: 'Interest-Free Available',
          description: 'Enjoy flexible finance options with interest-free payment plans.',
        },
      ],
    });
  } catch (err) {
    console.error('Get deals error:', err);
    res.status(500).json({ message: 'Failed to fetch deals content' });
  }
});

// PUT /api/deals - Save deals section content
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { title, subtitle, items } = req.body;
    const payload = {
      title: title || 'Limited-Time Weekly Deals',
      subtitle: subtitle || 'Comfortable furniture at straightforward prices. Flexible weekly payments available.',
      items: Array.isArray(items) ? items : [],
    };
    const valStr = JSON.stringify(payload);
    await pool.execute(
      "INSERT INTO site_settings (key, value, updated_at) VALUES ('homepage_deals', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')",
      [valStr, valStr]
    );
    res.json({ success: true, message: 'Deals section updated successfully' });
  } catch (err) {
    console.error('Save deals error:', err);
    res.status(500).json({ message: 'Failed to save deals content' });
  }
});

export default router;
