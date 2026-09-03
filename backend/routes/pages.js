import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import BACKEND_URL from '../helpers/backendUrl.js';

function resolveUrl(u) {
  if (!u) return u;
  if (u.startsWith('http')) return u;
  return `${BACKEND_URL}${u}`;
}

const router = Router();

// ── Helper: Upsert a site_settings key ──
function upsertSetting(key, value) {
  const [existing] = pool.execute('SELECT key FROM site_settings WHERE key = ?', [key]);
  if (existing.length > 0) {
    pool.execute('UPDATE site_settings SET value = ?, updated_at = datetime(\'now\') WHERE key = ?', [value, key]);
  } else {
    pool.execute('INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))', [key, value]);
  }
}

function getSetting(key) {
  const [rows] = pool.execute('SELECT value FROM site_settings WHERE key = ?', [key]);
  if (rows.length > 0) {
    try { return JSON.parse(rows[0].value || '{}'); } catch { return {}; }
  }
  return {};
}

// ── About Page ──

async function readAbout() {
  const [aboutRows] = pool.execute('SELECT * FROM about ORDER BY id DESC LIMIT 1');
  const about = aboutRows[0] || {};
  const [sections] = pool.execute('SELECT * FROM about_sections ORDER BY id ASC');
  const secMap = {};
  sections.forEach(s => { secMap[s.type] = s; });
  return {
    eyebrow: secMap.primary_section?.title || '',
    title: about.company_name || '',
    subtitle: about.description || '',
    story_title: secMap.primary_section?.title || '',
    story_content: secMap.primary_section?.description || '',
    story_image: secMap.primary_section?.image || '',
    features_title: secMap.features?.title || '',
    features_description: secMap.features?.description || '',
    val_1_title: secMap.value_1?.title || '',
    val_1_desc: secMap.value_1?.description || '',
    val_2_title: secMap.value_2?.title || '',
    val_2_desc: secMap.value_2?.description || '',
    val_3_title: secMap.value_3?.title || '',
    val_3_desc: secMap.value_3?.description || '',
    showroom_title: secMap.conclusion?.title || '',
    showroom_desc: secMap.conclusion?.description || '',
    showroom_image: secMap.conclusion?.image || '',
  };
}

async function writeAbout(data) {
  const { eyebrow, title, subtitle, story_title, story_content, story_image,
    val_1_title, val_1_desc, val_2_title, val_2_desc, val_3_title, val_3_desc,
    showroom_title, showroom_desc, showroom_image, features_title, features_description } = data;

  // Update about table
  const [aboutExisting] = pool.execute('SELECT id FROM about LIMIT 1');
  if (aboutExisting.length > 0) {
    pool.execute('UPDATE about SET company_name=?, tagline=?, description=? WHERE id=?',
      [title || '', subtitle || '', subtitle || '', aboutExisting[0].id]);
  } else {
    pool.execute('INSERT INTO about (company_name, tagline, description) VALUES (?, ?, ?)',
      [title || '', subtitle || '', subtitle || '']);
  }

  const sections = [
    { type: 'primary_section', title: story_title || eyebrow || '', description: story_content || '', image: story_image || '' },
    { type: 'features', title: features_title || 'OUR VALUES', description: features_description || 'What we stand for.', image: '' },
    { type: 'value_1', title: val_1_title || '', description: val_1_desc || '', image: '' },
    { type: 'value_2', title: val_2_title || '', description: val_2_desc || '', image: '' },
    { type: 'value_3', title: val_3_title || '', description: val_3_desc || '', image: '' },
    { type: 'conclusion', title: showroom_title || '', description: showroom_desc || '', image: showroom_image || '' },
  ];

  for (const sec of sections) {
    const [existing] = pool.execute('SELECT id FROM about_sections WHERE type=?', [sec.type]);
    if (existing.length > 0) {
      pool.execute('UPDATE about_sections SET title=?, description=?, image=?, updated_at=datetime(\'now\') WHERE type=?',
        [sec.title, sec.description, sec.image, sec.type]);
    } else {
      pool.execute('INSERT INTO about_sections (type, title, description, image) VALUES (?, ?, ?, ?)',
        [sec.type, sec.title, sec.description, sec.image]);
    }
  }
}

// ── Content Pages (terms, privacy-policy, delivery-info, returns) ──

const CONTENT_TABLES = {
  'terms': 'terms',
  'privacy-policy': 'privacy_policy',
  'delivery-info': 'delivery_info',
  'returns': 'returns',
};

async function readContentTable(pageKey) {
  const table = CONTENT_TABLES[pageKey];
  if (!table) return null;
  const [rows] = pool.execute(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 1`);
  const row = rows[0] || {};
  return { content: row.content || '', eyebrow: row.eyebrow || '', title: row.title || '', subtitle: row.subtitle || '' };
}

async function writeContentTable(pageKey, data) {
  const table = CONTENT_TABLES[pageKey];
  if (!table) return;

  const [existing] = pool.execute(`SELECT id FROM ${table} LIMIT 1`);
  if (existing.length > 0) {
    // Try to update with all fields, ignoring missing columns
    try {
      pool.execute(`UPDATE ${table} SET content=?, updated_at=datetime('now') WHERE id=?`, [data.content || '', existing[0].id]);
    } catch (e) {
      // If content column doesn't exist, try other approaches
      console.error(`Update ${table} error:`, e.message);
    }
  } else {
    try {
      pool.execute(`INSERT INTO ${table} (content) VALUES (?)`, [data.content || '']);
    } catch (e) {
      console.error(`Insert ${table} error:`, e.message);
    }
  }
}

// ── Home Page ──

function readHome() {
  const data = getSetting('homepage');
  const slides = data.hero_slides || [];
  const result = {};
  slides.forEach((s, i) => {
    result[`hero_${i + 1}_title`] = s.title || '';
    result[`hero_${i + 1}_subtitle`] = s.description || '';
    result[`hero_${i + 1}_tagline`] = s.tagline || '';
  });
  const deals = getSetting('deals');
  result.deals_headline = deals.title || '';
  result.deals_subtitle = deals.subtitle || '';
  return result;
}

function writeHome(data) {
  const current = getSetting('homepage');
  const slides = current.hero_slides || [];
  for (let i = 0; i < 5; i++) {
    if (data[`hero_${i + 1}_title`] !== undefined || data[`hero_${i + 1}_subtitle`] !== undefined) {
      if (!slides[i]) slides[i] = { image: '', tagline: '', title: '', description: '', button_link: '', active: true };
      if (data[`hero_${i + 1}_title`] !== undefined) slides[i].title = data[`hero_${i + 1}_title`];
      if (data[`hero_${i + 1}_subtitle`] !== undefined) slides[i].description = data[`hero_${i + 1}_subtitle`];
      if (data[`hero_${i + 1}_tagline`] !== undefined) slides[i].tagline = data[`hero_${i + 1}_tagline`];
    }
  }
  upsertSetting('homepage', JSON.stringify({ ...current, hero_slides: slides }));

  if (data.deals_headline !== undefined || data.deals_subtitle !== undefined) {
    const deals = getSetting('deals');
    if (data.deals_headline !== undefined) deals.title = data.deals_headline;
    if (data.deals_subtitle !== undefined) deals.subtitle = data.deals_subtitle;
    upsertSetting('deals', JSON.stringify(deals));
  }
}

// ── Contact Page ──

function readContact() {
  const contactData = getSetting('contact');
  if (Object.keys(contactData).length > 0) return contactData;

  // Fallback to individual settings
  return {
    eyebrow: 'GET IN TOUCH',
    title: 'Contact Us',
    subtitle: "We'd love to hear from you",
    phone: getSetting('contact_phone'),
    email: getSetting('contact_email'),
    address: getSetting('contact_address'),
    business_hours: getSetting('operating_hours'),
    facebook: getSetting('facebook_url'),
    instagram: getSetting('instagram_url'),
  };
}

function writeContact(data) {
  upsertSetting('contact', JSON.stringify(data));
}

// ── Routes ──

router.get('/:pageKey', (req, res) => {
  try {
    const { pageKey } = req.params;
    let data = {};

    switch (pageKey) {
      case 'about': data = readAbout(); break;
      case 'home': data = readHome(); break;
      case 'contact': data = readContact(); break;
      case 'terms':
      case 'privacy-policy':
      case 'delivery-info':
      case 'returns':
        data = readContentTable(pageKey) || {};
        break;
      case 'winz': {
        data = getSetting('winz');
        break;
      }
      default: return res.status(404).json({ message: 'Page not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Get page error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:pageKey', authenticateToken, (req, res) => {
  try {
    const { pageKey } = req.params;

    switch (pageKey) {
      case 'about': writeAbout(req.body); break;
      case 'home': writeHome(req.body); break;
      case 'contact': writeContact(req.body); break;
      case 'terms':
      case 'privacy-policy':
      case 'delivery-info':
      case 'returns':
        writeContentTable(pageKey, req.body);
        break;
      case 'winz': {
        upsertSetting('winz', JSON.stringify(req.body));
        break;
      }
      default: return res.status(404).json({ message: 'Page not found' });
    }
    res.json({ message: 'Page updated successfully' });
  } catch (error) {
    console.error('Update page error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

export default router;
