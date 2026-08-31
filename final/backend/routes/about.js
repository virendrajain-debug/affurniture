// ============================================================
// About Page API Routes
// ============================================================
// Manages company information for the About section:
//   GET  /api/about  - Get company info (public)
//   PUT  /api/about  - Update company info (protected)
// ============================================================

import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// -----------------------------------------------------------
// GET /api/about
// -----------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM about ORDER BY id DESC LIMIT 1');
    const dbAbout = rows[0] || {};

    const [settingRows] = await pool.execute('SELECT value FROM site_settings WHERE key = ?', ['page_about_data']);
    let savedData = {};
    if (settingRows.length > 0 && settingRows[0].value) {
      try {
        savedData = JSON.parse(settingRows[0].value);
      } catch {
        savedData = {};
      }
    }

    res.json({
      ...dbAbout,
      ...savedData,
      hero_eyebrow: savedData.hero_eyebrow || 'OUR STORY',
      hero_headline: savedData.hero_headline || dbAbout.company_name || 'About AF Furnishings',
      story_eyebrow: savedData.story_eyebrow || savedData.story_title || 'WHO WE ARE',
      story_title: savedData.story_title || savedData.story_eyebrow || 'WHO WE ARE',
      story_headline: savedData.story_headline || 'Crafting Comfort & Elegance for Every Home',
      mission_eyebrow: savedData.mission_eyebrow || savedData.values_eyebrow || 'OUR VALUES',
      values_eyebrow: savedData.values_eyebrow || savedData.mission_eyebrow || 'OUR VALUES',
      values_title: savedData.values_title || 'What we stand for.',
      team_eyebrow: savedData.team_eyebrow || 'OUR TEAM',
      team_title: savedData.team_title || 'Meet the people behind AF Furnishings.',
      about_story: savedData.about_story || dbAbout.description || '',
      about_mission: savedData.about_mission || savedData.values_title || 'What we stand for.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// PUT /api/about
// -----------------------------------------------------------
router.put('/', authenticateToken, async (req, res) => {
  try {
    const body = req.body || {};
    const { company_name, tagline, description, address, phone, email, about_story } = body;
    const desc = about_story || description || '';

    // Save full JSON payload in site_settings
    const dataVal = JSON.stringify(body);
    await pool.execute(
      'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime(\'now\')',
      ['page_about_data', dataVal, dataVal]
    );

    // Check if about record exists (update) or create new
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

    res.json({ message: 'About info updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

