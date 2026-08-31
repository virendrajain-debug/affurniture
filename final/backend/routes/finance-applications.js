import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendFinanceEmail } from '../helpers/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, 'finance-' + Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';

const router = Router();

// Public: submit finance application
router.post('/', upload.array('documents', 5), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address, city, state, income_source, products } = req.body;
    if (!first_name || !email || !phone) {
      return res.status(400).json({ message: 'First name, email and phone are required' });
    }
    const documents = req.files ? req.files.map(f => `${BACKEND_URL}/uploads/${f.filename}`) : [];
    const [result] = await pool.execute(
      'INSERT INTO finance_applications (first_name, last_name, email, phone, address, city, state, income_source, products, documents) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name || null, email, phone, address || null, city || null, state || null, income_source || null, products || null, JSON.stringify(documents)]
    );
    res.status(201).json({ message: 'Finance application submitted successfully', id: result.insertId });
    sendFinanceEmail({ first_name, last_name, email, phone, address, city, state, income_source, products }).catch(() => {});
  } catch (error) {
    console.error('Finance application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const BACKEND_URL_APP = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
function resolveUrlApp(u) { if (!u || u.startsWith('http')) return u; return `${BACKEND_URL_APP}${u}`; }

// Protected: get all finance applications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM finance_applications ORDER BY created_at DESC');
    const parsed = rows.map(r => ({
      ...r,
      documents: (typeof r.documents === 'string' ? JSON.parse(r.documents) : r.documents || []).map(d => resolveUrlApp(d))
    }));
    res.json(parsed);
  } catch (error) {
    console.error('Get finance applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: mark finance application as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.execute("UPDATE finance_applications SET status = 'read' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: get single finance application
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM finance_applications WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Application not found' });
    const app = rows[0];
    app.documents = (typeof app.documents === 'string' ? JSON.parse(app.documents) : app.documents || []).map(d => resolveUrlApp(d));
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: update status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE finance_applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected: delete finance application
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM finance_applications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
