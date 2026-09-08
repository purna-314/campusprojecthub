import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/faculty - list all faculty mentors
router.get('/', async (req, res) => {
  try {
    const faculty = await db.getFaculty();
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/faculty/:id/projects - get projects assigned to this faculty
router.get('/:id/projects', async (req, res) => {
  try {
    const projects = await db.getProjects({ mentorId: req.params.id });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
