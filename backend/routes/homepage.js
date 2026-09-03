// ============================================================
// Homepage API - Single source of truth for homepage data
// ============================================================

import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import BACKEND_URL from '../helpers/backendUrl.js';

function resolveUrl(u) {
  if (!u) return u;
  if (u.startsWith('http')) return u;
  return `${BACKEND_URL}${u}`;
}

function resolveSlides(slides) {
  if (!Array.isArray(slides)) return slides;
  return slides.map(s => ({
    ...s,
    image: resolveUrl(s.image),
  }));
}

function resolveBanners(banner) {
  if (!banner || typeof banner !== 'object') return banner;
  return { ...banner, image: resolveUrl(banner.image) };
}

function upsertSetting(key, value) {
  const [existing] = pool.execute('SELECT key FROM site_settings WHERE key = ?', [key]);
  if (existing.length > 0) {
    pool.execute('UPDATE site_settings SET value = ?, updated_at = datetime(\'now\') WHERE key = ?', [value, key]);
  } else {
    pool.execute('INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))', [key, value]);
  }
}

const router = Router();

router.get('/', (req, res) => {
  try {
    const [rows] = pool.execute("SELECT value FROM site_settings WHERE key = 'homepage'");
    if (rows.length > 0) {
      try {
        const data = JSON.parse(rows[0].value);
        if (data.hero_slides) data.hero_slides = resolveSlides(data.hero_slides);
        if (data.promo_banner_1) data.promo_banner_1 = resolveBanners(data.promo_banner_1);
        if (data.promo_banner_2) data.promo_banner_2 = resolveBanners(data.promo_banner_2);
        res.json(data);
      } catch { res.json({}); }
    } else {
      res.json({});
    }
  } catch (error) {
    console.error('Get homepage error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', authenticateToken, (req, res) => {
  try {
    const value = JSON.stringify(req.body);
    upsertSetting('homepage', value);
    pool.flush();
    res.json({ message: 'Homepage updated successfully' });
  } catch (error) {
    console.error('Update homepage error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
