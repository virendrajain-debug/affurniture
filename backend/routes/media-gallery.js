import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
const uploadsDir = path.join(__dirname, '../uploads');

function resolveUrl(u) {
  if (!u || u.startsWith('http')) return u;
  return `${BACKEND_URL}${u.startsWith('/') ? u : '/' + u}`;
}

const router = Router();

// GET /api/media-gallery - List all uploaded and used banner images
router.get('/', async (req, res) => {
  try {
    const gallery = [];
    const seenUrls = new Set();

    // 1. Scan uploads directory
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(f => {
        const ext = path.extname(f).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp'].includes(ext)) {
          const url = `${BACKEND_URL}/uploads/${f}`;
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            let createdAt = new Date().toISOString();
            try {
              const stat = fs.statSync(path.join(uploadsDir, f));
              createdAt = stat.mtime.toISOString();
            } catch {}
            gallery.push({
              id: f,
              filename: f,
              url,
              created_at: createdAt,
              type: 'upload',
            });
          }
        }
      });
    }

    // 2. Read images from page_banners table
    try {
      const [banners] = await pool.execute('SELECT id, image, title, page_key, slot FROM page_banners WHERE image IS NOT NULL AND image != ""');
      banners.forEach(b => {
        const resolved = resolveUrl(b.image);
        if (!seenUrls.has(resolved)) {
          seenUrls.add(resolved);
          const filename = path.basename(b.image.split('?')[0]);
          gallery.push({
            id: `banner-${b.id}`,
            filename: filename || `Banner ${b.page_key}`,
            url: resolved,
            created_at: new Date().toISOString(),
            type: 'banner',
          });
        }
      });
    } catch {}

    // Sort newest first
    gallery.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(gallery);
  } catch (err) {
    console.error('Get media gallery error:', err);
    res.status(500).json({ message: 'Failed to fetch media gallery' });
  }
});

// DELETE /api/media-gallery/:id - Delete an image from gallery/uploads
router.delete('/:id', async (req, res) => {
  try {
    const target = req.params.id;
    const urlQuery = req.query.url;

    // Check if filename in uploads dir
    if (fs.existsSync(uploadsDir)) {
      const filePath = path.join(uploadsDir, target);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Also check if url was passed
    if (urlQuery) {
      const rawName = path.basename(urlQuery.split('?')[0]);
      const filePath = path.join(uploadsDir, rawName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ success: true, message: 'Image deleted from gallery' });
  } catch (err) {
    console.error('Delete media gallery error:', err);
    res.status(500).json({ message: 'Failed to delete media item' });
  }
});

export default router;
