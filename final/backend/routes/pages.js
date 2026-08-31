// Unified page content route for the PageEditor in admin panel.
// Maps page keys to their respective database tables and settings:
//   about                 -> page_about_data & about table
//   winz                  -> page_winz_data in site_settings
//   finance               -> page_finance_data in site_settings
//   home, contact         -> page_home_data / page_contact_data & site_settings
//   delivery-info         -> delivery_info table & page_delivery-info_data
//   returns               -> returns table & page_returns_data
//   terms                 -> terms table & page_terms_data
//   privacy-policy        -> privacy_policy table & page_privacy-policy_data
//   shop-furniture        -> shop_furniture table & page_shop-furniture_data

import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }

const TABLE_MAP = {
  'delivery-info': 'delivery_info',
  'returns': 'returns',
  'terms': 'terms',
  'privacy-policy': 'privacy_policy',
  'shop-furniture': 'shop_furniture',
};

const router = Router();

// GET /api/pages/:pageKey
router.get('/:pageKey', async (req, res) => {
  try {
    const { pageKey } = req.params;

    // Check site_settings for rich page data first
    const [settingRows] = await pool.execute('SELECT value FROM site_settings WHERE key = ?', [`page_${pageKey}_data`]);
    let savedData = {};
    if (settingRows.length > 0 && settingRows[0].value) {
      try {
        savedData = JSON.parse(settingRows[0].value);
      } catch {
        savedData = {};
      }
    }

    if (pageKey === 'about') {
      const [aboutRows] = await pool.execute('SELECT * FROM about ORDER BY id DESC LIMIT 1');
      const dbAbout = aboutRows[0] || {};
      const merged = {
        ...dbAbout,
        ...savedData,
        page_key: 'about',
        about_story: savedData.about_story || dbAbout.description || '',
        about_mission: savedData.about_mission || savedData.values_title || 'What we stand for.',
      };
      return res.json(merged);
    }

    if (pageKey === 'winz' || pageKey === 'finance') {
      const defaults = pageKey === 'winz' ? {
        hero_banner: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=2000&q=85',
        title: 'Work and Income (WINZ) Quotes',
        subtitle: 'We provide approved WINZ quotes for essential household furniture and appliances across New Zealand.',
        intro_content: '<p>Need help furnishing your home with Work and Income assistance? AF Furnishings is a registered and approved WINZ supplier. We make getting a formal quote quick, stress-free, and straightforward.</p><p>You can request a quote online, over the phone, or in person at any of our showrooms in Auckland and Wellington.</p>',
        promo_banner: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
        promo_badge: 'OFFICIAL REGISTERED SUPPLIER',
        promo_title: 'Fast 24-Hour Quote Turnaround for WINZ Case Managers',
        steps_content: '<h3>How the WINZ Process Works:</h3><ol><li><strong>Select Your Items:</strong> Choose the lounge, bedroom, or dining furniture you need.</li><li><strong>Receive Your Official Quote:</strong> We generate an itemized PDF quote with our WINZ supplier details.</li><li><strong>Submit to Case Manager:</strong> Provide the quote to Work and Income for assessment.</li><li><strong>Delivery & Setup:</strong> Once approved, WINZ pays us directly and we deliver right to your door.</li></ol>',
        meta_description: 'Official WINZ quotes for essential furniture and appliances in New Zealand. Fast approval support and delivery.',
      } : {
        hero_banner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85',
        title: 'Flexible Furniture Finance & Weekly Payments',
        subtitle: 'Furnish your dream home today with manageable, budget-friendly weekly payment plans.',
        intro_content: '<p>At AF Furnishings, we believe quality living should be accessible to all New Zealanders. Our flexible financing solutions let you enjoy premium furniture now while spreading payments over comfortable weekly or fortnightly terms.</p><p>We partner with leading New Zealand finance providers to offer competitive rates and fast approval decisions.</p>',
        promo_banner: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        promo_badge: 'NO HIDDEN FEES',
        promo_title: 'Instant Online Pre-Approval in Under 5 Minutes',
        steps_content: '<h3>Easy 3-Step Financing:</h3><ol><li><strong>Apply Online:</strong> Complete our quick and secure finance application form.</li><li><strong>Instant Decision:</strong> Get assessed quickly with clear weekly payment breakdowns.</li><li><strong>Enjoy Your Furniture:</strong> Confirm your order and schedule prompt delivery to your home.</li></ol><p><em>Terms, lending criteria, and establishment fees apply.</em></p>',
        meta_description: 'Affordable weekly finance and flexible payment options for furniture across New Zealand.',
      };
      return res.json({ ...defaults, ...savedData, page_key: pageKey });
    }

    if (pageKey === 'home' || pageKey === 'contact') {
      const [rows] = await pool.execute('SELECT value FROM site_settings WHERE key = ?', [`page_${pageKey}_banner`]);
      const banner_image = rows.length > 0 ? resolveUrl(rows[0].value) : '';
      return res.json({ page_key: pageKey, banner_image, ...savedData });
    }

    const table = TABLE_MAP[pageKey];
    if (!table) return res.status(404).json({ message: 'Page not found' });

    const [rows] = await pool.execute(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 1`);
    const dbData = rows[0] || {};
    if (dbData.banner_image) dbData.banner_image = resolveUrl(dbData.banner_image);
    
    res.json({ ...dbData, ...savedData, page_key: pageKey });
  } catch (error) {
    console.error('Get page error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/pages/:pageKey
router.put('/:pageKey', authenticateToken, async (req, res) => {
  try {
    const { pageKey } = req.params;
    const body = req.body || {};
    const { content, banner_image, hero_banner } = body;

    // Persist full structured page data in site_settings JSON blob
    const dataKey = `page_${pageKey}_data`;
    const dataVal = JSON.stringify(body);
    await pool.execute(
      'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime(\'now\')',
      [dataKey, dataVal, dataVal]
    );

    if (pageKey === 'about') {
      const { company_name, tagline, description, address, phone, email, about_story } = body;
      const desc = about_story || description || '';
      const [existing] = await pool.execute('SELECT id FROM about LIMIT 1');
      if (existing.length > 0) {
        await pool.execute(
          'UPDATE about SET company_name=?, tagline=?, description=?, address=?, phone=?, email=? WHERE id=?',
          [company_name || 'AF Furnishings', tagline || '', desc, address || '', phone || '', email || '', existing[0].id]
        );
      } else {
        await pool.execute(
          'INSERT INTO about (company_name, tagline, description, address, phone, email) VALUES (?, ?, ?, ?, ?, ?)',
          [company_name || 'AF Furnishings', tagline || '', desc, address || '', phone || '', email || '']
        );
      }
      return res.json({ message: 'About page updated successfully' });
    }

    if (pageKey === 'winz' || pageKey === 'finance') {
      const bannerKey = `page_${pageKey}_banner`;
      const bannerVal = hero_banner || banner_image || '';
      if (bannerVal) {
        await pool.execute(
          'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime(\'now\')',
          [bannerKey, bannerVal, bannerVal]
        );
      }
      return res.json({ message: `${pageKey.toUpperCase()} page updated successfully` });
    }

    if (pageKey === 'home' || pageKey === 'contact') {
      const key = `page_${pageKey}_banner`;
      const val = banner_image || '';
      await pool.execute(
        'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime(\'now\')',
        [key, val, val]
      );
      return res.json({ message: 'Page updated successfully' });
    }

    const table = TABLE_MAP[pageKey];
    if (table) {
      const [existing] = await pool.execute(`SELECT id FROM ${table} LIMIT 1`);
      if (existing.length > 0) {
        await pool.execute(`UPDATE ${table} SET content = ?, banner_image = ? WHERE id = ?`, [content || body.body_html || '', banner_image || '', existing[0].id]);
      } else {
        await pool.execute(`INSERT INTO ${table} (content, banner_image) VALUES (?, ?)`, [content || body.body_html || '', banner_image || '']);
      }
    }

    res.json({ message: 'Page updated successfully' });
  } catch (error) {
    console.error('Update page error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

