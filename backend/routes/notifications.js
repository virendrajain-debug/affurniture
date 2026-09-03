import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/badge-counts', authenticateToken, (req, res) => {
  try {
    const [pending] = pool.execute(
      "SELECT COUNT(*) as count FROM enquiries WHERE status = 'pending'"
    );
    const [newReplies] = pool.execute(
      "SELECT COUNT(*) as count FROM enquiries WHERE reply IS NOT NULL AND reply_read = 0"
    );
    const [winzPending] = pool.execute(
      "SELECT COUNT(*) as count FROM winz_quotes WHERE status IS NULL OR status != 'read'"
    );
    const [financePending] = pool.execute(
      "SELECT COUNT(*) as count FROM finance_applications WHERE status IS NULL OR status != 'read'"
    );
    res.json({
      customerEnquiries: pending[0]?.count || 0,
      contactEnquiries: 0,
      winzQuotes: winzPending[0]?.count || 0,
      financeApplications: financePending[0]?.count || 0,
      total: (pending[0]?.count || 0) + (newReplies[0]?.count || 0) + (winzPending[0]?.count || 0) + (financePending[0]?.count || 0),
    });
  } catch (error) {
    console.error('Badge counts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
