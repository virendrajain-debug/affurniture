import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u.startsWith('/') ? u : '/' + u}`; }

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

    // 1. Read stored settings JSON blob
    const [settingRows] = await pool.execute('SELECT value FROM site_settings WHERE key = ?', [`page_${pageKey}_data`]);
    let savedData = {};
    if (settingRows.length > 0 && settingRows[0].value) {
      try {
        savedData = JSON.parse(settingRows[0].value);
      } catch {
        savedData = {};
      }
    }

    // 2. Read existing banners text for fallback
    const [bannerRows] = await pool.execute('SELECT slot, title, subtitle, description, label FROM page_banners WHERE page_key = ?', [pageKey]);
    const bannerMap = {};
    bannerRows.forEach(b => {
      bannerMap[b.slot] = b;
    });

    if (pageKey === 'about') {
      const [aboutRows] = await pool.execute('SELECT * FROM about ORDER BY id DESC LIMIT 1');
      const dbAbout = aboutRows[0] || {};
      const merged = {
        title: savedData.title || bannerMap['hero']?.title || dbAbout.company_name || 'About AF Furnishings',
        subtitle: savedData.subtitle || bannerMap['hero']?.subtitle || dbAbout.tagline || 'Quality furniture for every New Zealand home',
        eyebrow: savedData.eyebrow || bannerMap['hero']?.label || 'OUR STORY',
        story_title: savedData.story_title || bannerMap['story']?.title || 'Who We Are',
        story_content: savedData.story_content || savedData.content || bannerMap['story']?.description || dbAbout.description || '<p>AF Furnishings provides quality furniture, beds and appliances to make your home feel complete. We believe everyone deserves a comfortable home, which is why we offer flexible weekly payment options.</p><p>Founded in New Zealand, we have been serving families across the country with beautiful, durable furniture at honest prices.</p>',
        val_1_title: savedData.val_1_title || bannerMap['val_1']?.title || 'Quality First',
        val_1_desc: savedData.val_1_desc || bannerMap['val_1']?.description || 'Every piece is crafted from premium materials built to endure daily family life.',
        val_2_title: savedData.val_2_title || bannerMap['val_2']?.title || 'Comfort Always',
        val_2_desc: savedData.val_2_desc || bannerMap['val_2']?.description || 'Ergonomic designs tailored for genuine relaxation and peaceful sleep.',
        val_3_title: savedData.val_3_title || bannerMap['val_3']?.title || 'For Every Home',
        val_3_desc: savedData.val_3_desc || bannerMap['val_3']?.description || 'Accessible weekly finance options making dream living spaces affordable.',
        showroom_title: savedData.showroom_title || bannerMap['showroom']?.title || 'Experience Comfort in Person',
        showroom_desc: savedData.showroom_desc || bannerMap['showroom']?.description || 'Visit our contemporary showrooms in Auckland and Wellington to test-rest mattresses, explore fabrics, and consult our interior stylists.',
        ...savedData,
        page_key: 'about',
      };
      return res.json(merged);
    }

    if (pageKey === 'home') {
      const merged = {
        hero_1_title: savedData.hero_1_title || bannerMap['hero_1']?.title || 'Comfort made for everyday living.',
        hero_1_subtitle: savedData.hero_1_subtitle || bannerMap['hero_1']?.subtitle || 'Furniture, beds and appliances to make your home feel complete.',
        hero_2_title: savedData.hero_2_title || bannerMap['hero_2']?.title || 'Rest beautifully.',
        hero_2_subtitle: savedData.hero_2_subtitle || bannerMap['hero_2']?.subtitle || 'Discover beds, mattresses and bedroom sets designed for comfort.',
        hero_3_title: savedData.hero_3_title || bannerMap['hero_3']?.title || 'Gather around good moments.',
        hero_3_subtitle: savedData.hero_3_subtitle || bannerMap['hero_3']?.subtitle || 'Tables and chairs made for family gatherings and dinner parties.',
        deals_headline: savedData.deals_headline || 'Weekly Deals & Clearance',
        deals_subtitle: savedData.deals_subtitle || 'Save big on selected living and bedroom essentials this week only.',
        ...savedData,
        page_key: 'home',
      };
      return res.json(merged);
    }

    if (pageKey === 'winz' || pageKey === 'finance') {
      const defaults = pageKey === 'winz' ? {
        title: bannerMap['hero']?.title || 'Work and Income (WINZ) Quotes',
        subtitle: bannerMap['hero']?.subtitle || 'We provide approved WINZ quotes for essential household furniture and appliances across New Zealand.',
        eyebrow: 'OFFICIAL SUPPLIER',
        intro_content: '<p>Need help furnishing your home with Work and Income assistance? AF Furnishings is a registered and approved WINZ supplier. We make getting a formal quote quick, stress-free, and straightforward.</p><p>You can request a quote online, over the phone, or in person at any of our showrooms in Auckland and Wellington.</p>',
        cat_1_title: bannerMap['cat_1']?.title || 'Haven 3+2 Living Suite',
        cat_1_desc: bannerMap['cat_1']?.description || 'Plush comfort fabric sofa set with reinforced pine framing.',
        cat_2_title: bannerMap['cat_2']?.title || 'Willow Queen Bedroom Suite',
        cat_2_desc: bannerMap['cat_2']?.description || 'Solid timber bed frame paired with orthopaedic mattress.',
        cat_3_title: bannerMap['cat_3']?.title || 'Haven 6-Seater Dining Suite',
        cat_3_desc: bannerMap['cat_3']?.description || 'Durable timber dining table with 6 cushioned chairs.',
      } : {
        title: bannerMap['hero']?.title || 'Flexible Furniture Finance & Weekly Payments',
        subtitle: bannerMap['hero']?.subtitle || 'Furnish your dream home today with manageable, budget-friendly weekly payment plans.',
        eyebrow: 'EASY WEEKLY PLANS',
        intro_content: '<p>At AF Furnishings, we believe quality living should be accessible to all New Zealanders. Our flexible financing solutions let you enjoy premium furniture now while spreading payments over comfortable weekly or fortnightly terms.</p><p>We partner with leading New Zealand finance providers to offer competitive rates and fast approval decisions.</p>',
      };
      return res.json({ ...defaults, ...savedData, page_key: pageKey });
    }

    const table = TABLE_MAP[pageKey];
    let dbData = {};
    if (table) {
      const [rows] = await pool.execute(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 1`);
      if (rows.length > 0) dbData = rows[0];
    }

    res.json({
      title: bannerMap['hero']?.title || dbData.title || `${pageKey.replace('-', ' ').toUpperCase()}`,
      subtitle: bannerMap['hero']?.subtitle || dbData.subtitle || '',
      eyebrow: bannerMap['hero']?.label || 'AF FURNISHINGS',
      content: dbData.content || '',
      ...dbData,
      ...savedData,
      page_key: pageKey,
    });
  } catch (err) {
    console.error('Get page error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/pages/:pageKey - Save all page text and rich formatting
router.put('/:pageKey', async (req, res) => {
  try {
    const { pageKey } = req.params;
    const body = req.body || {};

    // 1. Save full JSON blob to site_settings
    const dataKey = `page_${pageKey}_data`;
    const dataVal = JSON.stringify(body);
    await pool.execute(
      "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')",
      [dataKey, dataVal, dataVal]
    );

    // 2. Sync to page_banners text fields so banners match
    if (pageKey === 'about') {
      const { title, subtitle, eyebrow, story_title, story_content, val_1_title, val_1_desc, val_2_title, val_2_desc, val_3_title, val_3_desc, showroom_title, showroom_desc } = body;

      // Sync about table
      try {
        const [existing] = await pool.execute('SELECT id FROM about LIMIT 1');
        if (existing.length > 0) {
          await pool.execute('UPDATE about SET company_name = ?, tagline = ?, description = ? WHERE id = ?', [title || 'AF Furnishings', subtitle || '', story_content || '', existing[0].id]);
        } else {
          await pool.execute('INSERT INTO about (company_name, tagline, description) VALUES (?, ?, ?)', [title || 'AF Furnishings', subtitle || '', story_content || '']);
        }
      } catch {}

      // Sync page_banners text
      const syncBannerText = async (slot, bTitle, bSub, bDesc, bLabel) => {
        try {
          await pool.execute(`
            UPDATE page_banners SET
              title = COALESCE(?, title),
              subtitle = COALESCE(?, subtitle),
              description = COALESCE(?, description),
              label = COALESCE(?, label)
            WHERE page_key = 'about' AND slot = ?
          `, [bTitle || null, bSub || null, bDesc || null, bLabel || null, slot]);
        } catch {}
      };

      await syncBannerText('hero', title, subtitle, null, eyebrow);
      await syncBannerText('story', story_title, null, story_content, null);
      await syncBannerText('val_1', val_1_title, null, val_1_desc, null);
      await syncBannerText('val_2', val_2_title, null, val_2_desc, null);
      await syncBannerText('val_3', val_3_title, null, val_3_desc, null);
      await syncBannerText('showroom', showroom_title, null, showroom_desc, null);
    } else if (pageKey === 'home') {
      const { hero_1_title, hero_1_subtitle, hero_2_title, hero_2_subtitle, hero_3_title, hero_3_subtitle } = body;
      const updateHero = async (slot, hTitle, hSub) => {
        try {
          await pool.execute("UPDATE page_banners SET title = COALESCE(?, title), subtitle = COALESCE(?, subtitle) WHERE page_key = 'home' AND slot = ?", [hTitle || null, hSub || null, slot]);
        } catch {}
      };
      await updateHero('hero_1', hero_1_title, hero_1_subtitle);
      await updateHero('hero_2', hero_2_title, hero_2_subtitle);
      await updateHero('hero_3', hero_3_title, hero_3_subtitle);
    } else {
      // Sync hero banner text for standard pages
      if (body.title || body.subtitle || body.eyebrow) {
        try {
          await pool.execute("UPDATE page_banners SET title = COALESCE(?, title), subtitle = COALESCE(?, subtitle), label = COALESCE(?, label) WHERE page_key = ? AND slot = 'hero'", [body.title || null, body.subtitle || null, body.eyebrow || null, pageKey]);
        } catch {}
      }

      // Sync dedicated database tables
      const table = TABLE_MAP[pageKey];
      if (table) {
        try {
          const [existing] = await pool.execute(`SELECT id FROM ${table} LIMIT 1`);
          if (existing.length > 0) {
            await pool.execute(`UPDATE ${table} SET content = ? WHERE id = ?`, [body.content || '', existing[0].id]);
          } else {
            await pool.execute(`INSERT INTO ${table} (content) VALUES (?)`, [body.content || '']);
          }
        } catch {}
      }
    }

    res.json({ success: true, message: 'Page texts & formatted content updated live on website!' });
  } catch (err) {
    console.error('Update page error:', err);
    res.status(500).json({ message: 'Failed to update page' });
  }
});

export default router;
