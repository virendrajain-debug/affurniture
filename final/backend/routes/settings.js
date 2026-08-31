import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrl(u) {
  if (!u || u.startsWith('http')) return u;
  return `${BACKEND_URL}${u}`;
}

const router = Router();

// Helper to fetch and normalize all site settings
async function getSettingsMap() {
  const [rows] = await pool.execute('SELECT key, value FROM site_settings');
  const settings = {};
  rows.forEach((r) => {
    const val = r.value;
    settings[r.key] = val && typeof val === 'string' && val.startsWith('/uploads/') ? resolveUrl(val) : val;
  });
  return settings;
}

// -----------------------------------------------------------
// GET /api/settings and GET /api/settings/global
// -----------------------------------------------------------
router.get(['/', '/global', '/all'], async (req, res) => {
  try {
    const settings = await getSettingsMap();
    
    // Also fetch active social links from database
    const [socialRows] = await pool.execute('SELECT platform, url FROM social_links WHERE enabled = 1 ORDER BY sort_order ASC').catch(() => [[]]);
    const socialMap = {};
    if (Array.isArray(socialRows)) {
      socialRows.forEach(s => {
        if (s.platform && s.url) {
          socialMap[`${s.platform.toLowerCase()}_url`] = s.url;
        }
      });
    }

    res.json({
      success: true,
      settings,
      // Global Brand Identity
      site_name: settings.site_name || settings.store_name || 'AF Furnishings',
      store_name: settings.site_name || settings.store_name || 'AF Furnishings',
      site_tagline: settings.site_tagline || 'Quality furniture for every New Zealand home',
      site_logo: settings.site_logo ? resolveUrl(settings.site_logo) : null,
      announcement_bar_text: settings.announcement_bar_text || 'Welcome to AF Furnishings • Quality pieces for every home',

      // Customer Support & Store Contact
      contact_phone: settings.contact_phone || settings.phone || '0800 222 548',
      phone: settings.contact_phone || settings.phone || '0800 222 548',
      contact_email: settings.contact_email || settings.customer_service_email || settings.email || 'affurniture@gmail.com',
      customer_service_email: settings.contact_email || settings.customer_service_email || settings.email || 'affurniture@gmail.com',
      email: settings.contact_email || settings.customer_service_email || settings.email || 'affurniture@gmail.com',
      admin_notification_email: settings.admin_notification_email || 'affurniture@gmail.com',
      contact_address: settings.contact_address || settings.address || 'Auckland, New Zealand',
      address: settings.contact_address || settings.address || 'Auckland, New Zealand',
      operating_hours: settings.operating_hours || settings.business_hours || 'Mon - Sat: 9:00 AM - 5:30 PM | Sun: 10:00 AM - 4:00 PM',
      business_hours: settings.operating_hours || settings.business_hours || 'Mon - Sat: 9:00 AM - 5:30 PM | Sun: 10:00 AM - 4:00 PM',

      // Social Media Profiles
      facebook_url: settings.facebook_url || settings.facebook || socialMap.facebook_url || 'https://facebook.com/affurnishings',
      instagram_url: settings.instagram_url || settings.instagram || socialMap.instagram_url || 'https://instagram.com/affurnishings',
      twitter_url: settings.twitter_url || settings.twitter || socialMap.twitter_url || '',
      youtube_url: settings.youtube_url || settings.youtube || socialMap.youtube_url || '',
      tiktok_url: settings.tiktok_url || settings.tiktok || socialMap.tiktok_url || '',
      linkedin_url: settings.linkedin_url || settings.linkedin || socialMap.linkedin_url || '',

      // Footer & Legal Notes
      footer_text: settings.footer_text || settings.footer_copyright || '© 2026 AF Furnishings. All rights reserved.',
      footer_copyright: settings.footer_text || settings.footer_copyright || '© 2026 AF Furnishings. All rights reserved.',
      footer_tagline: settings.footer_tagline || 'Secure payments • Friendly service • Home delivery',

      // SEO Defaults
      meta_title: settings.meta_title || settings.global_meta_title || 'AF Furnishings | Quality Living & Furniture NZ',
      meta_description: settings.meta_description || settings.global_meta_description || 'Shop high-quality lounge suites, bedroom furniture, beds and dining across New Zealand with flexible payment options.',
    });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
});

// -----------------------------------------------------------
// PUT /api/settings and PUT /api/settings/global
// -----------------------------------------------------------
router.put(['/', '/global'], auth, async (req, res) => {
  try {
    const payload = req.body || {};
    
    // Normalize aliases
    if (payload.store_name && !payload.site_name) payload.site_name = payload.store_name;
    if (payload.site_name && !payload.store_name) payload.store_name = payload.site_name;
    if (payload.contact_phone && !payload.phone) payload.phone = payload.contact_phone;
    if (payload.phone && !payload.contact_phone) payload.contact_phone = payload.phone;
    if (payload.contact_email && !payload.email) payload.email = payload.contact_email;
    if (payload.email && !payload.contact_email) payload.contact_email = payload.email;
    if (payload.contact_email && !payload.customer_service_email) payload.customer_service_email = payload.contact_email;
    if (payload.contact_address && !payload.address) payload.address = payload.contact_address;
    if (payload.address && !payload.contact_address) payload.contact_address = payload.address;
    if (payload.operating_hours && !payload.business_hours) payload.business_hours = payload.operating_hours;
    if (payload.business_hours && !payload.operating_hours) payload.operating_hours = payload.business_hours;
    if (payload.facebook_url && !payload.facebook) payload.facebook = payload.facebook_url;
    if (payload.instagram_url && !payload.instagram) payload.instagram = payload.instagram_url;
    if (payload.twitter_url && !payload.twitter) payload.twitter = payload.twitter_url;
    if (payload.youtube_url && !payload.youtube) payload.youtube = payload.youtube_url;
    if (payload.tiktok_url && !payload.tiktok) payload.tiktok = payload.tiktok_url;
    if (payload.linkedin_url && !payload.linkedin) payload.linkedin = payload.linkedin_url;
    if (payload.footer_text && !payload.footer_copyright) payload.footer_copyright = payload.footer_text;
    if (payload.meta_title && !payload.global_meta_title) payload.global_meta_title = payload.meta_title;
    if (payload.meta_description && !payload.global_meta_description) payload.global_meta_description = payload.meta_description;

    for (const [key, value] of Object.entries(payload)) {
      if (typeof value !== 'undefined' && value !== null) {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        await pool.execute(
          'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime(\'now\')',
          [key, valStr, valStr]
        );
      }
    }

    // Sync social links table
    const socialPlatforms = ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'linkedin'];
    for (const platform of socialPlatforms) {
      const url = payload[`${platform}_url`] || payload[platform];
      if (typeof url === 'string') {
        try {
          const [existing] = await pool.execute('SELECT id FROM social_links WHERE LOWER(platform) = ?', [platform]);
          if (existing.length > 0) {
            await pool.execute('UPDATE social_links SET url = ?, enabled = ? WHERE id = ?', [url, url.trim() ? 1 : 0, existing[0].id]);
          } else if (url.trim()) {
            await pool.execute('INSERT INTO social_links (platform, url, icon, sort_order, enabled) VALUES (?, ?, ?, 0, 1)', [platform, url, platform]);
          }
        } catch (e) {}
      }
    }

    // Also sync contact/about table if provided
    if (payload.email || payload.phone || payload.address) {
      try {
        const [existing] = await pool.execute('SELECT id FROM about LIMIT 1');
        if (existing.length > 0) {
          await pool.execute(
            'UPDATE about SET email=COALESCE(?, email), phone=COALESCE(?, phone), address=COALESCE(?, address) WHERE id=?',
            [payload.email || null, payload.phone || null, payload.address || null, existing[0].id]
          );
        }
      } catch (err) {}
    }

    res.json({ success: true, message: 'Global settings updated successfully' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

export default router;
