// ============================================================
// Unified Page Content API - Rebuilt from scratch
// ============================================================
// Single table stores ALL page content. No more confusion.
//
// Page types:
//   "standard" - Simple content pages (terms, privacy, delivery, returns)
//   "about"    - About page with sections (story, values, showroom)
//   "contact"  - Contact page with fields (phone, email, address)
//   "dynamic"  - Custom pages created by admin (any content)
//
// ENDPOINTS:
//   GET    /api/page-content              - List all pages
//   GET    /api/page-content/:slug        - Get single page by slug
//   POST   /api/page-content              - Create new page (auth)
//   PUT    /api/page-content/:slug        - Update page (auth)
//   DELETE /api/page-content/:slug        - Delete page (auth)
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

function parsePageContent(raw) {
  if (!raw) return '';
  if (typeof raw !== 'string') return raw;
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return resolveContentUrls(raw); }
  if (parsed && typeof parsed === 'object' && typeof parsed.content === 'string') {
    return parsed.content;
  }
  return resolveContentUrls(parsed);
}

function resolveContentUrls(content) {
  if (!content || typeof content !== 'object') return content;
  const resolved = { ...content };
  for (const [key, val] of Object.entries(resolved)) {
    if (typeof val === 'string' && (val.startsWith('/uploads/') || val.startsWith('uploads/'))) {
      resolved[key] = resolveUrl(val);
    }
  }
  return resolved;
}

const router = Router();

// ── LIST all pages ──
router.get('/', (req, res) => {
  try {
    const { page_type, active } = req.query;
    let sql = 'SELECT * FROM page_content WHERE 1=1';
    const params = [];
    if (page_type) { sql += ' AND page_type = ?'; params.push(page_type); }
    if (active === 'true') { sql += ' AND active = 1'; }
    sql += ' ORDER BY sort_order ASC, title ASC';
    const [rows] = pool.execute(sql, params);
    const pages = rows.map(r => ({
      ...r,
      content: parsePageContent(r.content),
      banner_image: resolveUrl(r.banner_image),
    }));
    res.json(pages);
  } catch (err) {
    console.error('List pages error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET single page by slug ──
router.get('/:slug', (req, res) => {
  try {
    const [rows] = pool.execute('SELECT * FROM page_content WHERE slug = ?', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ message: 'Page not found' });
    const page = rows[0];
    page.content = parsePageContent(page.content);
    page.banner_image = resolveUrl(page.banner_image);
    res.json(page);
  } catch (err) {
    console.error('Get page error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── CREATE new page ──
router.post('/', authenticateToken, (req, res) => {
  try {
    const { slug, title, content, page_type, banner_image, meta_description, sort_order, active } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });

    // Auto-generate slug from title if not provided
    let pageSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check slug uniqueness
    const [existing] = pool.execute('SELECT id FROM page_content WHERE slug = ?', [pageSlug]);
    if (existing.length > 0) {
      let suffix = 2;
      while (true) {
        const testSlug = `${pageSlug}-${suffix}`;
        const [dup] = pool.execute('SELECT id FROM page_content WHERE slug = ?', [testSlug]);
        if (dup.length === 0) { pageSlug = testSlug; break; }
        suffix++;
      }
    }

    const contentStr = typeof content === 'object' ? JSON.stringify(content) : (content || '{}');

    const [result] = pool.execute(
      `INSERT INTO page_content (slug, title, content, page_type, banner_image, meta_description, sort_order, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pageSlug,
        title,
        contentStr,
        page_type || 'dynamic',
        banner_image || '',
        meta_description || '',
        sort_order || 0,
        active !== undefined ? (active ? 1 : 0) : 1,
      ]
    );

    res.status(201).json({ message: 'Page created', id: result.insertId, slug: pageSlug });
  } catch (err) {
    console.error('Create page error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── UPDATE page by slug ──
router.put('/:slug', authenticateToken, (req, res) => {
  try {
    const { title, content, page_type, banner_image, meta_description, sort_order, active } = req.body;
    const { slug } = req.params;

    const [existing] = pool.execute('SELECT id FROM page_content WHERE slug = ?', [slug]);
    if (existing.length === 0) return res.status(404).json({ message: 'Page not found' });

    const contentStr = typeof content === 'object' ? JSON.stringify(content) : (content || '{}');

    pool.execute(
      `UPDATE page_content SET title=?, content=?, page_type=?, banner_image=?, meta_description=?, sort_order=?, active=?, updated_at=datetime('now')
       WHERE slug=?`,
      [
        title || '',
        contentStr,
        page_type || 'dynamic',
        banner_image || '',
        meta_description || '',
        sort_order || 0,
        active !== undefined ? (active ? 1 : 0) : 1,
        slug,
      ]
    );

    res.json({ message: 'Page updated successfully' });
  } catch (err) {
    console.error('Update page error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE page by slug ──
router.delete('/:slug', authenticateToken, (req, res) => {
  try {
    const [existing] = pool.execute('SELECT id, page_type FROM page_content WHERE slug = ?', [req.params.slug]);
    if (existing.length === 0) return res.status(404).json({ message: 'Page not found' });

    // Prevent deleting built-in pages
    const builtIn = ['about', 'on-sale', 'terms', 'privacy-policy', 'delivery-info', 'returns', 'contact'];
    if (builtIn.includes(req.params.slug)) {
      return res.status(400).json({ message: 'Cannot delete built-in pages' });
    }

    pool.execute('DELETE FROM page_content WHERE slug = ?', [req.params.slug]);
    res.json({ message: 'Page deleted' });
  } catch (err) {
    console.error('Delete page error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
