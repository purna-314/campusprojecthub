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
- `http://localhost:5000/api/health` $\rightarrow$ OK
- `http://localhost:5173` $\rightarrow$ Frontend live
- End-to-end milestone submission and faculty grading workflow tested and operational.
