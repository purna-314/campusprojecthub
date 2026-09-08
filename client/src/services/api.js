const API_BASE = '/api';

export const api = {
  // Projects
  async getProjects(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProjectById(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  async createProject(data) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create project');
    }
    return res.json();
  },

  async updateProject(id, data) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  async submitMilestone(projectId, milestoneId, data) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit milestone');
    return res.json();
  },

  async gradeMilestone(projectId, milestoneId, data) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/grade/${milestoneId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to grade milestone');
    return res.json();
  },

  async likeProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}/like`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to like project');
    return res.json();
  },

  // Batches
  async getBatches() {
    const res = await fetch(`${API_BASE}/batches`);
    if (!res.ok) throw new Error('Failed to fetch batches');
    return res.json();
  },

  async createBatch(data) {
    const res = await fetch(`${API_BASE}/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create batch');
    return res.json();
  },

  // Faculty
  async getFaculty() {
    const res = await fetch(`${API_BASE}/faculty`);
    if (!res.ok) throw new Error('Failed to fetch faculty');
    return res.json();
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async resetData() {
    const res = await fetch(`${API_BASE}/analytics/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset data');
    return res.json();
  }
};
