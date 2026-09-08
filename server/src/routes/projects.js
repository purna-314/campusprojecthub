import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/projects - list projects with filters
router.get('/', async (req, res) => {
  try {
    const { year, batchId, domain, status, search, mentorId } = req.query;
    const projects = await db.getProjects({ year, batchId, domain, status, search, mentorId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id - single project
router.get('/:id', async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects - register a new project
router.post('/', async (req, res) => {
  try {
    const { title, batchId, domain, tags, abstract, githubUrl, demoUrl, mentorId, teamLead, teamMembers } = req.body;
    if (!title || !batchId) {
      return res.status(400).json({ error: 'Title and Batch are required' });
    }
    const newProject = await db.createProject({
      title,
      batchId,
      domain,
      tags,
      abstract,
      githubUrl,
      demoUrl,
      mentorId,
      teamLead,
      teamMembers
    });
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id - update project details or guide status
router.put('/:id', async (req, res) => {
  try {
    const updated = await db.updateProject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/milestones/:milestoneId - student submit milestone
router.post('/:id/milestones/:milestoneId', async (req, res) => {
  try {
    const { fileUrl, githubBranch, notes } = req.body;
    const updated = await db.submitMilestone(req.params.id, req.params.milestoneId, { fileUrl, githubBranch, notes });
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/grade/:milestoneId - faculty grade milestone
router.post('/:id/grade/:milestoneId', async (req, res) => {
  try {
    const { score, feedback, status } = req.body;
    const updated = await db.gradeMilestone(req.params.id, req.params.milestoneId, { score, feedback, status });
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/like - upvote / like a project
router.post('/:id/like', async (req, res) => {
  try {
    const project = await db.likeProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ likes: project.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
