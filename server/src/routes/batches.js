import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/batches - list all batches across years
router.get('/', async (req, res) => {
  try {
    const batches = await db.getBatches();
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/batches/:id
router.get('/:id', async (req, res) => {
  try {
    const batch = await db.getBatchById(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/batches - create a new batch/cohort
router.post('/', async (req, res) => {
  try {
    const { name, year, yearLabel, projectType, department, academicYear, coordinator, milestones } = req.body;
    if (!name || !year) {
      return res.status(400).json({ error: 'Batch name and year are required' });
    }
    const newBatch = await db.createBatch({
      name,
      year: Number(year),
      yearLabel: yearLabel || `${year}${year == 1 ? 'st' : year == 2 ? 'nd' : year == 3 ? 'rd' : 'th'} Year`,
      projectType: projectType || 'Mandatory Academic Project',
      department: department || 'Engineering & Technology',
      academicYear: academicYear || '2024-2025',
      coordinator: coordinator || 'Head of Department',
      maxTeamSize: Number(req.body.maxTeamSize) || 4,
      minTeamSize: Number(req.body.minTeamSize) || 1,
      milestones: milestones || [
        { id: 'm1', title: 'Topic Selection & Synopsis', weight: 20, dueDate: '2026-10-15', description: 'Problem formulation & team charter' },
        { id: 'm2', title: 'System Architecture', weight: 30, dueDate: '2026-11-15', description: 'Design specs & tech choices' },
        { id: 'm3', title: 'Final Demo & Report', weight: 50, dueDate: '2026-12-15', description: 'Working project & viva defense' }
      ]
    });
    res.status(201).json(newBatch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
