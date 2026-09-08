import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialBatches, initialFaculty, initialProjects } from './seedData.js';
import { isMongoConnected, resetCloudDb } from './config/db.js';
import { BatchModel } from './models/Batch.js';
import { FacultyModel } from './models/Faculty.js';
import { ProjectModel } from './models/Project.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, '../data/db.json');

class Database {
  constructor() {
    this.data = {
      batches: [],
      faculty: [],
      projects: []
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.resetLocal();
      }
    } catch (err) {
      console.error('Error reading db.json, re-initializing with seed data:', err);
      this.resetLocal();
    }
  }

  saveLocal() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to db.json:', err);
    }
  }

  resetLocal() {
    this.data = {
      batches: JSON.parse(JSON.stringify(initialBatches)),
      faculty: JSON.parse(JSON.stringify(initialFaculty)),
      projects: JSON.parse(JSON.stringify(initialProjects))
    };
    this.saveLocal();
  }

  async reset() {
    if (isMongoConnected) {
      await resetCloudDb();
    }
    this.resetLocal();
    return true;
  }

  // --- Batches & Years ---
  async getBatches() {
    if (isMongoConnected) {
      return await BatchModel.find({}).lean();
    }
    return this.data.batches;
  }

  async getBatchById(id) {
    if (isMongoConnected) {
      return await BatchModel.findOne({ id }).lean();
    }
    return this.data.batches.find(b => b.id === id);
  }

  async createBatch(batchData) {
    const newBatch = {
      id: `batch-${Date.now()}`,
      ...batchData,
      status: 'active'
    };

    if (isMongoConnected) {
      const created = await BatchModel.create(newBatch);
      return created.toObject();
    }

    this.data.batches.push(newBatch);
    this.saveLocal();
    return newBatch;
  }

  // --- Faculty ---
  async getFaculty() {
    if (isMongoConnected) {
      return await FacultyModel.find({}).lean();
    }
    return this.data.faculty;
  }

  async getFacultyById(id) {
    if (isMongoConnected) {
      return await FacultyModel.findOne({ id }).lean();
    }
    return this.data.faculty.find(f => f.id === id);
  }

  // --- Projects ---
  async getProjects(filters = {}) {
    if (isMongoConnected) {
      const query = {};
      if (filters.year) query.year = Number(filters.year);
      if (filters.batchId) query.batchId = filters.batchId;
      if (filters.status && filters.status !== 'all') query.status = filters.status;
      if (filters.mentorId) query.mentorId = filters.mentorId;
      if (filters.domain && filters.domain !== 'all') {
        query.domain = { $regex: filters.domain, $options: 'i' };
      }
      if (filters.search) {
        const regex = { $regex: filters.search, $options: 'i' };
        query.$or = [
          { title: regex },
          { abstract: regex },
          { tags: regex },
          { 'teamLead.name': regex },
          { 'teamLead.rollNo': regex },
          { mentorName: regex }
        ];
      }
      const list = await ProjectModel.find(query).sort({ createdAt: -1 }).lean();
      return list;
    }

    let list = [...this.data.projects];
    if (filters.year) {
      list = list.filter(p => String(p.year) === String(filters.year));
    }
    if (filters.batchId) {
      list = list.filter(p => p.batchId === filters.batchId);
    }
    if (filters.domain && filters.domain !== 'all') {
      list = list.filter(p => p.domain?.toLowerCase().includes(filters.domain.toLowerCase()));
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter(p => p.status === filters.status);
    }
    if (filters.mentorId) {
      list = list.filter(p => p.mentorId === filters.mentorId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q)) ||
        p.teamLead?.name?.toLowerCase().includes(q) ||
        p.teamMembers?.some(m => m.name.toLowerCase().includes(q) || m.rollNo.toLowerCase().includes(q))
      );
    }
    return list;
  }

  async getProjectById(id) {
    if (isMongoConnected) {
      return await ProjectModel.findOne({ id }).lean();
    }
    return this.data.projects.find(p => p.id === id);
  }

  async createProject(projectData) {
    const batch = await this.getBatchById(projectData.batchId);
    const mentor = await this.getFacultyById(projectData.mentorId);

    const milestoneSubmissions = {};
    if (batch && batch.milestones) {
      batch.milestones.forEach(m => {
        milestoneSubmissions[m.id] = {
          status: 'pending',
          submittedAt: null,
          fileUrl: null,
          githubBranch: null,
          notes: null,
          score: null,
          feedback: null
        };
      });
    }

    const newProject = {
      id: `proj-${Date.now()}`,
      title: projectData.title,
      batchId: projectData.batchId,
      year: batch ? batch.year : 1,
      yearLabel: batch ? batch.yearLabel : "1st Year",
      projectType: batch ? batch.projectType : "Student Project",
      department: projectData.department || (batch ? batch.department : "Computer Science & Engineering"),
      domain: projectData.domain || "General Tech",
      tags: Array.isArray(projectData.tags) ? projectData.tags : (projectData.tags ? projectData.tags.split(',').map(t => t.trim()) : []),
      abstract: projectData.abstract || "",
      githubUrl: projectData.githubUrl || "",
      demoUrl: projectData.demoUrl || "",
      status: "pending_review",
      overallScore: null,
      mentorId: projectData.mentorId || null,
      mentorName: mentor ? mentor.name : "Unassigned",
      teamLead: projectData.teamLead || { name: "Student Lead", rollNo: "0000", email: "" },
      teamMembers: projectData.teamMembers || [],
      milestoneSubmissions: milestoneSubmissions,
      featured: false,
      likes: 0,
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      const created = await ProjectModel.create(newProject);
      return created.toObject();
    }

    this.data.projects.unshift(newProject);
    this.saveLocal();
    return newProject;
  }

  async updateProject(id, updates) {
    if (isMongoConnected) {
      const updated = await ProjectModel.findOneAndUpdate(
        { id },
        { ...updates, updatedAt: new Date().toISOString() },
        { returnDocument: 'after' }
      ).lean();
      return updated;
    }

    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;

    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveLocal();
    return this.data.projects[idx];
  }

  async submitMilestone(projectId, milestoneId, submission) {
    const project = await this.getProjectById(projectId);
    if (!project) return null;

    const key = `milestoneSubmissions.${milestoneId}`;
    const milestoneData = {
      status: 'submitted',
      submittedAt: new Date().toISOString().split('T')[0],
      fileUrl: submission.fileUrl || null,
      githubBranch: submission.githubBranch || 'main',
      notes: submission.notes || '',
    };

    if (isMongoConnected) {
      const updated = await ProjectModel.findOneAndUpdate(
        { id: projectId },
        { $set: { [key]: milestoneData } },
        { returnDocument: 'after' }
      ).lean();
      return updated;
    }

    if (!project.milestoneSubmissions) project.milestoneSubmissions = {};
    project.milestoneSubmissions[milestoneId] = {
      ...(project.milestoneSubmissions[milestoneId] || {}),
      ...milestoneData
    };
    this.saveLocal();
    return project;
  }

  async gradeMilestone(projectId, milestoneId, grading) {
    const project = await this.getProjectById(projectId);
    if (!project) return null;

    const key = `milestoneSubmissions.${milestoneId}`;
    const milestoneData = {
      status: grading.status || 'graded',
      score: Number(grading.score),
      feedback: grading.feedback || '',
      gradedAt: new Date().toISOString().split('T')[0]
    };

    const batch = await this.getBatchById(project.batchId);

    if (isMongoConnected) {
      const doc = await ProjectModel.findOne({ id: projectId });
      if (!doc) return null;
      if (!doc.milestoneSubmissions) doc.milestoneSubmissions = {};
      doc.milestoneSubmissions[milestoneId] = {
        ...(doc.milestoneSubmissions[milestoneId] || {}),
        ...milestoneData
      };
      doc.markModified('milestoneSubmissions');

      // Recalculate score
      let totalScore = 0;
      let gradedCount = 0;
      if (batch && batch.milestones) {
        batch.milestones.forEach(m => {
          const sub = doc.milestoneSubmissions[m.id];
          if (sub && typeof sub.score === 'number') {
            totalScore += sub.score;
            gradedCount++;
          }
        });
        if (gradedCount === batch.milestones.length) {
          doc.overallScore = Math.round(totalScore);
          doc.status = 'completed';
        }
      }
      await doc.save();
      return doc.toObject();
    }

    if (!project.milestoneSubmissions) project.milestoneSubmissions = {};
    project.milestoneSubmissions[milestoneId] = {
      ...(project.milestoneSubmissions[milestoneId] || {}),
      ...milestoneData
    };

    let totalScore = 0;
    let gradedCount = 0;
    if (batch && batch.milestones) {
      batch.milestones.forEach(m => {
        const sub = project.milestoneSubmissions[m.id];
        if (sub && typeof sub.score === 'number') {
          totalScore += sub.score;
          gradedCount++;
        }
      });
      if (gradedCount === batch.milestones.length) {
        project.overallScore = Math.round(totalScore);
        project.status = 'completed';
      }
    }

    this.saveLocal();
    return project;
  }

  async likeProject(id) {
    if (isMongoConnected) {
      const updated = await ProjectModel.findOneAndUpdate(
        { id },
        { $inc: { likes: 1 } },
        { returnDocument: 'after' }
      ).lean();
      return updated;
    }

    const project = this.data.projects.find(p => p.id === id);
    if (project) {
      project.likes = (project.likes || 0) + 1;
      this.saveLocal();
    }
    return project;
  }

  // --- Analytics ---
  async getAnalytics() {
    const projects = await this.getProjects();
    const batches = await this.getBatches();

    const totalProjects = projects.length;
    const approvedProjects = projects.filter(p => p.status === 'approved' || p.status === 'completed').length;
    const pendingReviews = projects.filter(p => p.status === 'pending_review').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    const yearStats = [1, 2, 3, 4].map(yr => {
      const yrProjects = projects.filter(p => p.year === yr);
      const yrBatch = batches.find(b => b.year === yr);
      return {
        year: yr,
        yearLabel: `${yr}${yr === 1 ? 'st' : yr === 2 ? 'nd' : yr === 3 ? 'rd' : 'th'} Year`,
        batchName: yrBatch ? yrBatch.name : `Year ${yr}`,
        projectType: yrBatch ? yrBatch.projectType : 'Mandatory Project',
        total: yrProjects.length,
        approved: yrProjects.filter(p => p.status === 'approved' || p.status === 'completed').length,
        pending: yrProjects.filter(p => p.status === 'pending_review').length,
        avgScore: yrProjects.filter(p => p.overallScore).length 
          ? Math.round(yrProjects.filter(p => p.overallScore).reduce((acc, p) => acc + p.overallScore, 0) / yrProjects.filter(p => p.overallScore).length)
          : null
      };
    });

    const domainCounts = {};
    projects.forEach(p => {
      const d = p.domain || 'Other';
      domainCounts[d] = (domainCounts[d] || 0) + 1;
    });

    return {
      storageEngine: isMongoConnected ? 'MongoDB Cloud (Atlas)' : 'Local File JSON Store',
      isMongoConnected,
      totalProjects,
      approvedProjects,
      pendingReviews,
      completedProjects,
      yearStats,
      domainCounts
    };
  }
}

export const db = new Database();
