import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) {
  if (!u || u.startsWith('http')) return u;
  return `${BACKEND_URL}${u}`;
}

const router = Router();

// Default fallback hero slides
const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85',
    alt: 'Modern green sofa in a living room',
    tagline: 'AF FURNISHINGS',
    title: 'Comfort made for everyday living.',
    description: 'Furniture, beds and appliances to make your home feel complete.',
    button_link: '/category/lounge-suite',
    sort_order: 0,
    active: 1,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=2000&q=85',
    alt: 'Cozy bedroom with wooden furniture',
    tagline: 'BEDROOM COLLECTION',
    title: 'Rest beautifully.',
    description: 'Discover beds, mattresses and bedroom sets designed for comfort.',
    button_link: '/category/bedroom',
    sort_order: 1,
    active: 1,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=2000&q=85',
    alt: 'Elegant dining room setup',
    tagline: 'DINING COLLECTION',
    title: 'Gather around good moments.',
    description: 'Tables and chairs made for family gatherings and dinner parties.',
    button_link: '/category/dining',
    sort_order: 2,
    active: 1,
  },
];

// GET /api/homepage
router.get('/', async (req, res) => {
  try {
    // 1. Fetch hero slides from hero_sliders table
    let heroSlides = [];
    try {
      const [rows] = await pool.execute('SELECT * FROM hero_sliders ORDER BY sort_order ASC, id ASC');
      if (rows.length > 0) {
        heroSlides = rows.map(r => ({
          ...r,
          image: resolveUrl(r.image),
          active: Boolean(r.active),
        }));
      }
    } catch (e) {
      console.warn('Hero sliders query fallback:', e.message);
    }

    if (heroSlides.length === 0) {
      heroSlides = DEFAULT_HERO_SLIDES;
    }

    // 2. Fetch promo banners and featured categories from site_settings
    let promoBanner1 = {
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85',
      badge: 'AF WEEKLY SPECIAL',
      title: 'Bring comfort home.',
      subtitle: 'Explore our latest living-room arrivals with flexible weekly payments.',
      button_text: 'Shop Living',
      button_link: '/category/living',
    };

    let promoBanner2 = {
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1800&q=85',
      badge: 'NEW ARRIVALS',
      title: 'Bedroom & Dining Essentials',
      subtitle: 'Premium handcrafted furniture built for New Zealand homes.',
      button_text: 'Explore Deals',
      button_link: '/on-sale',
    };

    let featuredCategoryIds = [];

    try {
      const [settingsRows] = await pool.execute(
        "SELECT key, value FROM site_settings WHERE key IN ('homepage_promo_banner_1', 'homepage_promo_banner_2', 'homepage_featured_categories', 'homepage_data')"
      );

      settingsRows.forEach(r => {
        try {
          if (r.key === 'homepage_promo_banner_1' && r.value) {
            const parsed = JSON.parse(r.value);
            promoBanner1 = { ...promoBanner1, ...parsed, image: resolveUrl(parsed.image) };
          } else if (r.key === 'homepage_promo_banner_2' && r.value) {
            const parsed = JSON.parse(r.value);
            promoBanner2 = { ...promoBanner2, ...parsed, image: resolveUrl(parsed.image) };
          } else if (r.key === 'homepage_featured_categories' && r.value) {
            featuredCategoryIds = JSON.parse(r.value);
          } else if (r.key === 'homepage_data' && r.value) {
            const parsed = JSON.parse(r.value);
            if (parsed.promo_banner_1) promoBanner1 = { ...promoBanner1, ...parsed.promo_banner_1, image: resolveUrl(parsed.promo_banner_1.image) };
            if (parsed.promo_banner_2) promoBanner2 = { ...promoBanner2, ...parsed.promo_banner_2, image: resolveUrl(parsed.promo_banner_2.image) };
            if (Array.isArray(parsed.featured_categories)) featuredCategoryIds = parsed.featured_categories;
          }
        } catch (err) {}
      });
    } catch (e) {}

    // 3. Fetch all categories to enrich featured categories
    let allCategories = [];
    try {
      const [catRows] = await pool.execute('SELECT id, name, slug, image FROM categories ORDER BY id ASC');
      allCategories = catRows.map(c => ({
        ...c,
        image: resolveUrl(c.image),
      }));
    } catch (e) {}

    // If featured categories not configured, default to all valid categories (excluding outdoor/office)
    if (!Array.isArray(featuredCategoryIds) || featuredCategoryIds.length === 0) {
      featuredCategoryIds = allCategories.filter(c => !['Office', 'Outdoor'].includes(c.name)).map(c => String(c.id));
    }

    res.json({
      success: true,
      hero_slides: heroSlides,
      promo_banner_1: promoBanner1,
      promo_banner_2: promoBanner2,
      featured_categories: featuredCategoryIds,
      all_categories: allCategories,
    });
  } catch (err) {
    console.error('Get homepage error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch homepage data' });
  }
});

// PUT /api/homepage
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { hero_slides, promo_banner_1, promo_banner_2, featured_categories } = req.body || {};

    // 1. Sync hero slides to hero_sliders table if provided
    if (Array.isArray(hero_slides)) {
      try {
        await pool.execute('DELETE FROM hero_sliders');
        for (let i = 0; i < hero_slides.length; i++) {
          const s = hero_slides[i];
          if (s.image || s.title) {
            await pool.execute(
              'INSERT INTO hero_sliders (image, alt, tagline, title, description, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [
                s.image || '',
                s.alt || s.title || '',
                s.tagline || '',
                s.title || '',
                s.description || s.desc || '',
                i,
                s.active !== false ? 1 : 0,
              ]
            );
          }
        }
      } catch (e) {
        console.warn('Hero sliders update error:', e.message);
      }
    }

    // 2. Persist banners & categories in site_settings
    if (promo_banner_1) {
      const valStr = JSON.stringify(promo_banner_1);
      await pool.execute(
        "INSERT INTO site_settings (key, value, updated_at) VALUES ('homepage_promo_banner_1', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')",
        [valStr, valStr]
      );
    }

    if (promo_banner_2) {
      const valStr = JSON.stringify(promo_banner_2);
      await pool.execute(
        "INSERT INTO site_settings (key, value, updated_at) VALUES ('homepage_promo_banner_2', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')",
        [valStr, valStr]
      );
    }

    if (Array.isArray(featured_categories)) {
      const valStr = JSON.stringify(featured_categories);
      await pool.execute(
        "INSERT INTO site_settings (key, value, updated_at) VALUES ('homepage_featured_categories', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')",
        [valStr, valStr]
      );
    }

    // Save master homepage_data object
    const masterVal = JSON.stringify({
      hero_slides,
      promo_banner_1,
      promo_banner_2,
      featured_categories,
    });
    await pool.execute(
      "INSERT INTO site_settings (key, value, updated_at) VALUES ('homepage_data', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')",
      [masterVal, masterVal]
    );

    res.json({ success: true, message: 'Homepage content saved and published successfully' });
  } catch (err) {
    console.error('Update homepage error:', err);
    res.status(500).json({ success: false, message: 'Failed to update homepage' });
  }
});

export default router;
