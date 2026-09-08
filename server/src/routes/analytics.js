import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/analytics/summary - year-wise and domain-wise statistics
router.get('/summary', async (req, res) => {
  try {
    const stats = await db.getAnalytics();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analytics/reset - reset db to initial seed data
router.post('/reset', async (req, res) => {
  try {
    await db.reset();
    res.json({ message: 'Database reset to initial demo state successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
