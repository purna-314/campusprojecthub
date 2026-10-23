# 🎓 Campus Project Hub (UniProject)

A full-stack web application designed for colleges and universities where **every batch of students across all academic years (1st, 2nd, 3rd, and 4th year) must complete a mandatory project**.

---

## 🌟 Key Highlights & Architecture

- **Academic Year & Batch Hierarchy**:
  - **1st Year (Freshmen)**: Social Innovation & Community Impact Projects
  - **2nd Year (Sophomore)**: Minor Hardware / Software Projects
  - **3rd Year (Junior)**: Domain Specialization Mini-Projects (AI/ML, IoT, CyberSec, Web)
  - **4th Year (Senior)**: Major Capstone Engineering Projects
- **Interactive Multi-Role Portal**:
  - 🎓 **Student View (Alex Rivera - 4th Year)**: Track project team, view milestone deadlines, submit deliverables, and inspect guide feedback.
  - 👩‍🏫 **Faculty Guide View (Dr. Sarah Jenkins)**: Review student proposals, inspect deliverables, and evaluate with rubrics & feedback.
  - 🏛️ **HOD / Admin View (Prof. Alan Turing)**: Real-time year-wise progress metrics, batch configurations, faculty guide workload balancing, and 1-click CSV report export for college accreditations (NAAC / NBA).
- **Public Campus Project Showcase**: Searchable project repository with domain filtering, year pills, GitHub links, and live demo access.
- **Persistent Data Store**: Structured JSON store (`server/data/db.json`) pre-populated with realistic campus projects, batches, and faculties.

---

## 🚀 How to Run

### Prerequisites
- Node.js (v18+) and npm installed.

### Quick Start (Runs both Backend API & React UI)
From the root directory:
```bash
npm start
```
Or run individually:
- **Backend API**:
  ```bash
  cd server
  npm run dev
  # Server runs on http://localhost:5000
  ```
- **Frontend App**:
  ```bash
  cd client
  npm run dev
  # Web App runs on http://localhost:5173
  ```

---

## 📂 Project Structure

```
campus_project_hub/
├── start-dev.js               # Concurrently boots backend & frontend
├── package.json               # Root scripts
├── README.md
├── server/                    # Node.js Express REST API
│   ├── data/
│   │   └── db.json            # Persistent JSON database (auto-seeded)
│   └── src/
│       ├── index.js           # Server entry point & CORS
│       ├── db.js              # Database controller & query logic
│       ├── seedData.js        # Realistic projects, batches, and faculties
│       └── routes/
│           ├── projects.js    # CRUD, milestone submission, grading, upvotes
│           ├── batches.js     # Year-wise batch cohorts & milestones
│           ├── faculty.js     # Mentors & load distribution
│           └── analytics.js   # Department metrics & demo reset
└── client/                    # React 19 + Vite + Tailwind CSS UI
    ├── src/
    │   ├── App.jsx            # Main app shell & tabs navigation
    │   ├── context/
    │   │   └── AuthContext.jsx # Role switcher (Student / Faculty / HOD)
    │   ├── services/
    │   │   └── api.js         # REST client
    │   └── components/
    │       ├── Navbar.jsx              # Header with role switcher
    │       ├── Showcase.jsx            # Year-wise project gallery
    │       ├── ProjectDetailsModal.jsx # Project milestones & reviews
    │       ├── StudentDashboard.jsx    # Student workspace
    │       ├── FacultyDashboard.jsx    # Mentor review & grading
    │       ├── AdminDashboard.jsx      # HOD stats & CSV export
    │       └── NewProjectModal.jsx     # Project registration form
```

---

## 🎯 Verification & Testing

Both servers have been verified:
- `http://localhost:5000/api/health` → OK
- `http://localhost:5173` → Frontend live & builds cleanly with zero errors
- End-to-end milestone submission, faculty grading, role auth, and analytics operational.

---

## 🌐 Production Deployment Guide

This project is pre-configured for production hosting with **Render** (Backend API) and **Vercel** (Frontend UI).

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: audit, optimize and prepare project for production deployment"
git push origin main
```

---

### 2. Backend Deployment (Render.com)

1. Sign in to [Render](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Name**: `campusprojecthub-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Health Check Path**: `/api/health`
5. Under **Environment Variables**, add:
   | Variable | Value / Description |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (or leave default, Render sets this automatically) |
   | `JWT_SECRET` | Strong random string (e.g., generate via `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | Your Vercel frontend URL, e.g. `https://campusprojecthub.vercel.app` |
   | `MONGODB_URI` *(Optional)* | MongoDB Atlas connection string (if omitted, falls back to local JSON store) |
   | `SMTP_HOST` *(Optional)* | SMTP server host (e.g. `smtp.gmail.com`) for production OTP emails |
   | `SMTP_PORT` *(Optional)* | `587` |
   | `SMTP_USER` *(Optional)* | Your email address |
   | `SMTP_PASS` *(Optional)* | Gmail App Password or SMTP credentials |
   | `EMAIL_FROM` *(Optional)* | `"Campus Project Hub" <no-reply@campusprojecthub.edu>` |
6. Click **Deploy Web Service** and copy your backend URL (e.g. `https://campusprojecthub-api.onrender.com`).

*(Note: `server/render.yaml` is also included if using Render Blueprints)*

---

### 3. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository.
4. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | Your Render backend URL, e.g. `https://campusprojecthub-api.onrender.com` |
6. Update `client/vercel.json` if using Vercel API rewrites with your deployed Render URL.
7. Click **Deploy**. Vercel will build and publish your high-performance static React 19 application.
