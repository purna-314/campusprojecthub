const rawBase = import.meta.env.VITE_API_URL || '';
const API_BASE = rawBase ? (rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`) : '/api';

export const TOKEN_STORAGE_KEY = 'campus_auth_token';

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (_e) {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to update localStorage auth token:', e);
  }
}

function authHeaders(extraHeaders = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse(res, defaultErrorMsg = 'Request failed') {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    if (!res.ok) {
      const err = new Error(json.error || defaultErrorMsg);
      if (json.unverified !== undefined) err.unverified = json.unverified;
      if (json.email) err.email = json.email;
      if (json.devCode) err.devCode = json.devCode;
      if (json.previewUrl) err.previewUrl = json.previewUrl;
      throw err;
    }
    return json;
  }

  const text = await res.text();
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('API endpoint not found (HTTP 404). Please ensure VITE_API_URL is set in Vercel to your deployed Render URL and redeployed.');
    }
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(`Backend server unavailable (HTTP ${res.status}). Your Render free instance is likely waking up — please retry in 30 seconds.`);
    }
    throw new Error(text.slice(0, 100) || defaultErrorMsg);
  }

  try {
    return JSON.parse(text);
  } catch (_e) {
    return text;
  }
}

export const api = {
  // --- Authentication ---
  auth: {
    async register(data) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return parseResponse(res, 'Registration failed');
    },

    async verifyEmail({ email, code, token }) {
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, token }),
      });
      const json = await parseResponse(res, 'Verification failed');
      if (json.token) setAuthToken(json.token);
      return json;
    },

    async resendVerification(email) {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return parseResponse(res, 'Failed to resend code');
    },

    async login({ email, password }) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await parseResponse(res, 'Failed to sign in');
      if (json.token) setAuthToken(json.token);
      return json;
    },

    async getMe() {
      const token = getAuthToken();
      if (!token) return null;
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        setAuthToken(null);
        return null;
      }
      const data = await parseResponse(res, 'Failed to load user profile');
      return data?.user || null;
    },

    async forgotPassword(email) {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return parseResponse(res, 'Failed to request password reset');
    },

    async resetPassword({ email, code, newPassword }) {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      return parseResponse(res, 'Failed to reset password');
    },

    logout() {
      setAuthToken(null);
    }
  },

  // --- Projects ---
  async getProjects(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
    return parseResponse(res, 'Failed to fetch projects');
  },

  async getProjectById(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    return parseResponse(res, 'Failed to fetch project');
  },

  async createProject(data) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res, 'Failed to create project');
  },

  async updateProject(id, data) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res, 'Failed to update project');
  },

  async submitMilestone(projectId, milestoneId, data) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res, 'Failed to submit milestone');
  },

  async gradeMilestone(projectId, milestoneId, data) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/grade/${milestoneId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res, 'Failed to grade milestone');
  },

  async likeProject(id) {
    const res = await fetch(`${API_BASE}/projects/${id}/like`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return parseResponse(res, 'Failed to like project');
  },

  // --- Batches ---
  async getBatches() {
    const res = await fetch(`${API_BASE}/batches`);
    return parseResponse(res, 'Failed to fetch batches');
  },

  async createBatch(data) {
    const res = await fetch(`${API_BASE}/batches`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return parseResponse(res, 'Failed to create batch');
  },

  // --- Faculty ---
  async getFaculty() {
    const res = await fetch(`${API_BASE}/faculty`);
    return parseResponse(res, 'Failed to fetch faculty');
  },

  // --- Analytics ---
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    return parseResponse(res, 'Failed to fetch analytics');
  },

  async resetData() {
    const res = await fetch(`${API_BASE}/analytics/reset`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return parseResponse(res, 'Failed to reset data');
  }
};
