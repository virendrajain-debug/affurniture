import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `testimonial-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  }
});

function resolveUrl(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL}${u}`; }

const router = Router();

function mapAdminFields(body) {
  return {
    name: body.name || body.client_name || '',
    role: body.role || body.role_or_city || 'Customer',
    quote: body.quote || body.review_text || '',
    avatar: body.avatar || body.avatar_url || '',
    location: body.location || '',
    rating: Number(body.rating) || 5,
    sort_order: Number(body.sort_order) || 0,
    active: body.active !== undefined ? body.active : (body.is_active !== undefined ? body.is_active : 1),
  };
}

// GET / - public (website needs it without auth)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM testimonials WHERE active = 1 ORDER BY sort_order ASC, created_at DESC');
    res.json(rows.map(r => ({
      ...r,
      avatar: resolveUrl(r.avatar),
      client_name: r.name,
      role_or_city: r.role,
      review_text: r.quote,
      is_active: r.active,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch testimonials', error: err.message });
  }
});

// GET /all - protected (admin panel needs all)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC');
    res.json(rows.map(r => ({
      ...r,
      avatar: resolveUrl(r.avatar),
      client_name: r.name,
      role_or_city: r.role,
      review_text: r.quote,
      is_active: r.active,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch testimonials', error: err.message });
  }
});

// POST / - create (accepts both JSON and multipart)
router.post('/', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const mapped = mapAdminFields(req.body);
    if (req.file) mapped.avatar = `${BACKEND_URL}/uploads/${req.file.filename}`;
    else if (mapped.avatar) mapped.avatar = resolveUrl(mapped.avatar);

    if (!mapped.name || !mapped.quote) return res.status(400).json({ message: 'Name and quote are required' });

    const [result] = await pool.execute(
      'INSERT INTO testimonials (name, role, quote, avatar, location, rating, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [mapped.name, mapped.role, mapped.quote, mapped.avatar, mapped.location, mapped.rating, mapped.sort_order, mapped.active]
    );
    const [rows] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [result.insertId]);
    const r = rows[0];
    res.status(201).json({ ...r, avatar: resolveUrl(r.avatar), client_name: r.name, role_or_city: r.role, review_text: r.quote, is_active: r.active });
  } catch (err) {
    console.error('Create testimonial error:', err.message);
    res.status(500).json({ message: 'Failed to create testimonial', error: err.message });
  }
});

// PUT /:id - update (accepts both JSON and multipart)
router.put('/:id', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const mapped = mapAdminFields(req.body);
    const [existing] = await pool.execute('SELECT avatar FROM testimonials WHERE id = ?', [req.params.id]);
    if (req.file) mapped.avatar = `${BACKEND_URL}/uploads/${req.file.filename}`;
    else if (mapped.avatar) mapped.avatar = resolveUrl(mapped.avatar);
    else mapped.avatar = existing[0]?.avatar || '';

    await pool.execute(
      'UPDATE testimonials SET name = ?, role = ?, quote = ?, avatar = ?, location = ?, rating = ?, sort_order = ?, active = ?, updated_at = datetime("now") WHERE id = ?',
      [mapped.name, mapped.role, mapped.quote, mapped.avatar, mapped.location, mapped.rating, mapped.sort_order, mapped.active, req.params.id]
    );
    const [rows] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    const r = rows[0];
    res.json({ ...r, avatar: resolveUrl(r.avatar), client_name: r.name, role_or_city: r.role, review_text: r.quote, is_active: r.active });
  } catch (err) {
    console.error('Update testimonial error:', err.message);
    res.status(500).json({ message: 'Failed to update testimonial', error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete testimonial', error: err.message });
  }
});

router.put('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    await pool.execute('UPDATE testimonials SET active = NOT active, updated_at = datetime("now") WHERE id = ?', [req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    const r = rows[0];
    res.json({ message: 'Toggled', is_active: r?.active, active: r?.active });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle testimonial', error: err.message });
  }
});

export default router;
