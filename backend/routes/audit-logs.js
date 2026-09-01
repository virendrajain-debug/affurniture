import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Auto-create audit_logs table if missing
(async () => {
  try {
    await pool.execute(`CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT,
      action TEXT,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
  } catch {}
})();

// GET /api/audit-logs - List all audit logs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200');
    res.json(rows);
  } catch {
    res.json([]);
  }
});

// DELETE /api/audit-logs/clear - Clear all audit logs
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await pool.execute('DELETE FROM audit_logs');
    res.json({ message: 'Audit logs cleared' });
  } catch {
    res.json({ message: 'Audit logs cleared' });
  }
});

export default router;
