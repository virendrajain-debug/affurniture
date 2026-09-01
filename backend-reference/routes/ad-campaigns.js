import { Router } from 'express';
import pool from '../config/db.js';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u.startsWith('/') ? u : '/' + u}`; }

const router = Router();

// GET /api/ad-campaigns - Get the active Campaign Ad Banner
router.get('/', async (req, res) => {
  try {
    let campaign = null;

    // Check site_settings first
    const [settings] = await pool.execute("SELECT value FROM site_settings WHERE key = 'homepage_promo_banner_1'");
    if (settings.length > 0 && settings[0].value) {
      try {
        campaign = JSON.parse(settings[0].value);
      } catch {}
    }

    if (!campaign) {
      // Check ad_campaigns table
      const [rows] = await pool.execute('SELECT * FROM ad_campaigns ORDER BY id DESC LIMIT 1');
      if (rows.length > 0) campaign = rows[0];
    }

    if (!campaign) {
      campaign = {
        badge: 'AF WEEKLY SPECIAL',
        title: 'Bring comfort home.',
        subtitle: 'Explore our latest living-room arrivals, all priced at $00.',
        description: 'Explore our latest living-room arrivals, all priced at $00.',
        button_text: 'VIEW',
        cta_text: 'VIEW',
        button_link: '/category/living',
        cta_link: '/category/living',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85',
        active: 1
      };
    }

    res.json({
      ...campaign,
      image: resolveUrl(campaign.image),
      badge: campaign.badge || 'AF WEEKLY SPECIAL',
      title: campaign.title || 'Bring comfort home.',
      subtitle: campaign.subtitle || campaign.description || 'Explore our latest living-room arrivals, all priced at $00.',
      button_text: campaign.button_text || campaign.cta_text || 'VIEW',
      button_link: campaign.button_link || campaign.cta_link || '/category/living',
    });
  } catch (err) {
    console.error('Get ad campaign error:', err);
    res.status(500).json({ message: 'Failed to fetch campaign' });
  }
});

// GET /api/ad-campaigns/active - Storefront endpoint
router.get('/active', async (req, res) => {
  try {
    const [settings] = await pool.execute("SELECT value FROM site_settings WHERE key = 'homepage_promo_banner_1'");
    let campaign = null;
    if (settings.length > 0 && settings[0].value) {
      try { campaign = JSON.parse(settings[0].value); } catch {}
    }
    if (!campaign) {
      const [rows] = await pool.execute('SELECT * FROM ad_campaigns WHERE active = 1 ORDER BY id DESC LIMIT 1');
      if (rows.length > 0) campaign = rows[0];
    }

    if (campaign) {
      return res.json({
        ...campaign,
        image: resolveUrl(campaign.image),
      });
    }
    res.json(null);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/ad-campaigns - Save Campaign Ad Banner
router.post('/', async (req, res) => {
  try {
    const { badge, title, subtitle, description, button_text, cta_text, button_link, cta_link, image } = req.body;
    if (!image || !image.trim()) {
      return res.status(400).json({ message: 'Campaign banner image is required' });
    }

    const payload = {
      badge: (badge || 'AF WEEKLY SPECIAL').trim(),
      title: (title || 'Bring comfort home.').trim(),
      subtitle: (subtitle || description || 'Explore our latest living-room arrivals, all priced at $00.').trim(),
      description: (description || subtitle || 'Explore our latest living-room arrivals, all priced at $00.').trim(),
      button_text: (button_text || cta_text || 'VIEW').trim(),
      cta_text: (cta_text || button_text || 'VIEW').trim(),
      button_link: (button_link || cta_link || '/category/living').trim(),
      cta_link: (cta_link || button_link || '/category/living').trim(),
      image: image.trim(),
      active: 1
    };

    // 1. Save to site_settings (for immediate storefront homepage sync)
    const jsonStr = JSON.stringify(payload);
    await pool.execute(
      "INSERT INTO site_settings (key, value, updated_at) VALUES ('homepage_promo_banner_1', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')",
      [jsonStr, jsonStr]
    );

    // 2. Also save to ad_campaigns table
    try {
      await pool.execute(
        'INSERT INTO ad_campaigns (name, image, link, position, sort_order, active, badge, title, description, cta_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [payload.title, payload.image, payload.button_link, 'homepage', 0, 1, payload.badge, payload.title, payload.description, payload.button_text]
      );
    } catch {}

    // 3. Also sync to page_banners table (home slot promo_1)
    try {
      await pool.execute(`
        INSERT INTO page_banners (page_key, slot, label, title, subtitle, image, cta_text, cta_link, sort_order, active)
        VALUES ('home', 'promo_1', ?, ?, ?, ?, ?, ?, 0, 1)
        ON CONFLICT(page_key, slot) DO UPDATE SET
          label = excluded.label, title = excluded.title, subtitle = excluded.subtitle, image = excluded.image, cta_text = excluded.cta_text, cta_link = excluded.cta_link, active = 1
      `, [payload.badge, payload.title, payload.subtitle, payload.image, payload.button_text, payload.button_link]);
    } catch {}

    res.json({ success: true, message: 'Ad Campaign saved & live on storefront website!', campaign: payload });
  } catch (err) {
    console.error('Save ad campaign error:', err);
    res.status(500).json({ message: 'Failed to save ad campaign' });
  }
});

export default router;
