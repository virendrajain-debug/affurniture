// Notifications route - maps to enquiry notifications
// Admin panel sidebar calls GET /api/notifications/badge-counts

import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/badge-counts', authenticateToken, async (req, res) => {
  try {
    const [pending] = await pool.execute(
      "SELECT COUNT(*) as count FROM enquiries WHERE status = 'pending'"
    );
    const [newReplies] = await pool.execute(
      "SELECT COUNT(*) as count FROM enquiries WHERE reply IS NOT NULL AND reply_read = 0"
    );
    const [winzPending] = await pool.execute(
      "SELECT COUNT(*) as count FROM winz_quotes WHERE status IS NULL OR status != 'read'"
    );
    const [financePending] = await pool.execute(
      "SELECT COUNT(*) as count FROM finance_applications WHERE status IS NULL OR status != 'read'"
    );
    res.json({
      enquiries: pending[0]?.count || 0,
      replies: newReplies[0]?.count || 0,
      winz_quotes: winzPending[0]?.count || 0,
      finance: financePending[0]?.count || 0,
      total: (pending[0]?.count || 0) + (newReplies[0]?.count || 0) + (winzPending[0]?.count || 0) + (financePending[0]?.count || 0),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
