import { Router } from 'express';
import pool from '../config/db.js';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u.startsWith('/') ? u : '/' + u}`; }

const router = Router();

// Auto-migrate description column
(async () => {
  try {
    await pool.execute('ALTER TABLE page_banners ADD COLUMN description TEXT DEFAULT NULL');
  } catch {}
})();

// GET /api/page-banners - Public endpoint for both Admin and Storefront
router.get('/', async (req, res) => {
  try {
    const { page_key, slot } = req.query;
    let sql = 'SELECT * FROM page_banners';
    const params = [];
    const conditions = [];

    if (page_key && page_key !== 'all') {
      conditions.push('(page_key = ? OR (page_key = "home" AND ? = "homepage"))');
      params.push(page_key, page_key);
    }
    if (slot && slot !== 'all') {
      conditions.push('slot = ?');
      params.push(slot);
    }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY sort_order ASC, id ASC';

    const [rows] = await pool.execute(sql, params);
    res.json(rows.map(r => ({ ...r, image: resolveUrl(r.image) })));
  } catch (err) {
    console.error('Get page banners error:', err);
    res.status(500).json({ message: 'Failed to fetch page banners' });
  }
});

// Helper for atomic upsert
async function upsertBanner(data) {
  const { page_key, slot, label, title, subtitle, description, image, cta_text, cta_link, sort_order, active } = data;
  const pKey = (page_key || 'home').trim();
  const sKey = (slot || 'hero').trim();
  const isActive = active !== undefined ? (active ? 1 : 0) : 1;

  await pool.execute(`
    INSERT INTO page_banners (page_key, slot, label, title, subtitle, description, image, cta_text, cta_link, sort_order, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(page_key, slot) DO UPDATE SET
      label = excluded.label,
      title = excluded.title,
      subtitle = excluded.subtitle,
      description = excluded.description,
      image = excluded.image,
      cta_text = excluded.cta_text,
      cta_link = excluded.cta_link,
      sort_order = excluded.sort_order,
      active = excluded.active
  `, [
    pKey,
    sKey,
    label || title || pKey,
    title || null,
    subtitle || null,
    description || null,
    image.trim(),
    cta_text || null,
    cta_link || null,
    sort_order || 0,
    isActive
  ]);

  // Sync to hero_sliders if it is a homepage hero slide
  if ((pKey === 'home' || pKey === 'homepage') && sKey.startsWith('hero')) {
    try {
      await pool.execute(`
        INSERT INTO hero_sliders (title, description, tagline, image, button_link, button_text, sort_order, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        title || '',
        subtitle || description || '',
        label || 'AF FURNISHINGS',
        image.trim(),
        cta_link || '/category/lounge-suite',
        cta_text || 'Explore Collection',
        sort_order || 0,
        isActive
      ]);
    } catch {}
  }

  const [row] = await pool.execute('SELECT * FROM page_banners WHERE page_key = ? AND slot = ?', [pKey, sKey]);
  return row[0];
}

// POST /api/page-banners - Create / Upsert banner
router.post('/', async (req, res) => {
  try {
    const { page_key, image } = req.body;
    if (!page_key || !page_key.trim()) return res.status(400).json({ message: 'Page key is required' });
    if (!image || !image.trim()) return res.status(400).json({ message: 'Banner image is required' });

    const saved = await upsertBanner(req.body);
    res.json({ message: 'Banner saved & live on storefront', banner: saved });
  } catch (err) {
    console.error('Create page banner error:', err);
    res.status(500).json({ message: 'Failed to save banner' });
  }
});

// PUT /api/page-banners/:id - Update / Upsert banner
router.put('/:id', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image || !image.trim()) return res.status(400).json({ message: 'Banner image is required' });

    const saved = await upsertBanner(req.body);
    res.json({ message: 'Banner updated & live on storefront', banner: saved });
  } catch (err) {
    console.error('Update page banner error:', err);
    res.status(500).json({ message: 'Failed to update banner' });
  }
});

export default router;
