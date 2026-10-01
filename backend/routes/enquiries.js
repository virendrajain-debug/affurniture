// ============================================================
// Enquiries API Routes
// ============================================================
// Handles customer enquiry/interest forms:
//   GET    /api/enquiries              - List enquiries (protected)
//   GET    /api/enquiries/notifications - Get unread count (protected)
//   GET    /api/enquiries/:id          - Single enquiry detail (protected)
//   POST   /api/enquiries              - Submit new enquiry (public)
//   PUT    /api/enquiries/:id/status   - Update enquiry status (protected)
//   PUT    /api/enquiries/:id/reply    - Admin reply (protected)
//   DELETE /api/enquiries/:id          - Delete enquiry (protected)
//
// ENQUIRY TYPES:
//   - "product": Customer clicked "Add to enquiry" on a product
//   - "contact": Customer filled the Contact form
// ============================================================

import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendEnquiryEmail } from '../helpers/email.js';

const router = Router();

// -----------------------------------------------------------
// GET /api/enquiries/notifications
// -----------------------------------------------------------
// Get count of unread notifications (new enquiries + admin replies)
// -----------------------------------------------------------
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const [pending] = await pool.execute(
      "SELECT COUNT(*) as count FROM enquiries WHERE status = 'pending'"
    );
    const [newReplies] = await pool.execute(
      "SELECT COUNT(*) as count FROM enquiries WHERE reply IS NOT NULL AND reply_read = 0"
    );
    res.json({
      pending: pending[0]?.count || 0,
      newReplies: newReplies[0]?.count || 0,
      total: (pending[0]?.count || 0) + (newReplies[0]?.count || 0),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// PUT /api/enquiries/mark-read
// -----------------------------------------------------------
// Mark all notifications as read
// -----------------------------------------------------------
router.put('/mark-read', authenticateToken, async (req, res) => {
  try {
    await pool.execute("UPDATE enquiries SET reply_read = 1 WHERE reply IS NOT NULL AND reply_read = 0");
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// GET /api/enquiries
// -----------------------------------------------------------
// List all enquiries. REQUIRES AUTHENTICATION.
// QUERY: ?type=product&status=pending (both optional)
// -----------------------------------------------------------
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = 'SELECT * FROM enquiries WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const [enquiries] = pool.execute(query, params);
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// PUT /api/enquiries/:id/read
// -----------------------------------------------------------
// Mark a single enquiry as read (status = 'read').
// -----------------------------------------------------------
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await pool.execute("UPDATE enquiries SET status = 'read' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// GET /api/enquiries/:id
// -----------------------------------------------------------
// Get single enquiry detail. REQUIRES AUTHENTICATION.
// -----------------------------------------------------------
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = pool.execute('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// POST /api/enquiries
// -----------------------------------------------------------
// Submit a new enquiry. PUBLIC endpoint (no auth needed).
// Used by both the website product cards and the contact form.
// -----------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, product_id, product_name, message, type, size, size_price } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const parsedSizePrice = size_price !== undefined && size_price !== null && size_price !== '' && Number.isFinite(Number(size_price))
      ? Number(size_price)
      : null;

    const [result] = await pool.execute(
      'INSERT INTO enquiries (name, email, phone, product_id, product_name, message, type, size, size_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, product_id || null, product_name || null, message || null, type || 'product', size || null, parsedSizePrice]
    );

    const emailMessage = [
      message || '',
      size ? `Size: ${size}${parsedSizePrice !== null ? ` ($${parsedSizePrice.toLocaleString()})` : ''}.` : '',
    ].filter(Boolean).join(' ');

    sendEnquiryEmail({ name, email, phone, product_name, message: emailMessage, type }).catch(() => {});


    res.status(201).json({ message: 'Enquiry submitted successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// PUT /api/enquiries/:id/status
// -----------------------------------------------------------
// Update enquiry status (pending -> replied -> closed).
// REQUIRES AUTHENTICATION.
// -----------------------------------------------------------
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    pool.execute('UPDATE enquiries SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// PUT /api/enquiries/:id/reply
// -----------------------------------------------------------
// Admin reply to an enquiry. REQUIRES AUTHENTICATION.
// Sets reply text, marks status as 'replied', sets reply_read = 0
// so user can see the reply on the website.
// -----------------------------------------------------------
router.put('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }
    pool.execute(
      "UPDATE enquiries SET reply = ?, status = 'replied', replied_at = datetime('now'), reply_read = 0 WHERE id = ?",
      [reply.trim(), req.params.id]
    );
    res.json({ message: 'Reply sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// -----------------------------------------------------------
// DELETE /api/enquiries/:id
// -----------------------------------------------------------
// Delete an enquiry. REQUIRES AUTHENTICATION.
// -----------------------------------------------------------
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    pool.execute('DELETE FROM enquiries WHERE id = ?', [req.params.id]);
    res.json({ message: 'Enquiry deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
