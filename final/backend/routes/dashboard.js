// ============================================================
// Dashboard Stats API Route
// ============================================================
// Returns aggregated statistics for the admin dashboard:
//   GET /api/dashboard - Get all dashboard stats (protected)
//
// RESPONSE:
//   {
//     "stats": {
//       "totalCategories": 5,
//       "totalProducts": 12,
//       "totalEnquiries": 3,
//       "inStockProducts": 10,
//       "outOfStockProducts": 2,
//       "contactEnquiries": 1
//     },
//     "recentEnquiries": [...]
//   }
// ============================================================

import { Router } from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/dashboard - Get dashboard statistics (PROTECTED)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Run all count queries in parallel for speed
    const [catCount] = await pool.execute('SELECT COUNT(*) as count FROM categories');
    const [prodCount] = await pool.execute('SELECT COUNT(*) as count FROM products');
    const [enqCount] = await pool.execute('SELECT COUNT(*) as count FROM enquiries');
    const [inStock] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE stock > 0');
    const [outStock] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE stock = 0');
    const [contactEnq] = await pool.execute("SELECT COUNT(*) as count FROM enquiries WHERE type = 'contact'");

    // Get recent 10 enquiries for the table
    const [recentEnquiries] = await pool.execute(
      "SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 10"
    );

    res.json({
      stats: {
        totalCategories: catCount[0].count,
        totalProducts: prodCount[0].count,
        totalEnquiries: enqCount[0].count,
        inStockProducts: inStock[0].count,
        outOfStockProducts: outStock[0].count,
        contactEnquiries: contactEnq[0].count,
      },
      recentEnquiries,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
