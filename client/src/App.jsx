import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Showcase from './components/Showcase';
import StudentDashboard from './components/StudentDashboard';
import FacultyDashboard from './components/FacultyDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProjectDetailsModal from './components/ProjectDetailsModal';
import NewProjectModal from './components/NewProjectModal';
import AuthModal from './components/AuthModal';
import { api } from './services/api';

function MainApp() {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState('showcase'); // 'showcase' | 'student_dashboard' | 'faculty_dashboard' | 'admin_dashboard'
  const [projects, setProjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projData, batchData, facData, analyticsData] = await Promise.all([
        api.getProjects(),
        api.getBatches(),
        api.getFaculty(),
        api.getAnalytics()
      ]);
      setProjects(projData);
      setBatches(batchData);
      setFaculty(facData);
      setAnalytics(analyticsData);

      // If selectedProject is currently open, refresh its data as well
      if (selectedProject) {
        const refreshed = projData.find(p => p.id === selectedProject.id);
        if (refreshed) setSelectedProject(refreshed);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When currentRole changes, if activeTab is not showcase, sync it to relevant dashboard
  useEffect(() => {
    if (activeTab !== 'showcase') {
      if (currentRole === 'student') setActiveTab('student_dashboard');
      if (currentRole === 'faculty') setActiveTab('faculty_dashboard');
      if (currentRole === 'admin') setActiveTab('admin_dashboard');
    }
  }, [currentRole]);

  const selectedBatch = batches.find(b => b.id === selectedProject?.batchId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'showcase' && (
          <Showcase
            projects={projects}
            batches={batches}
            loading={loading}
            onSelectProject={(proj) => setSelectedProject(proj)}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'student_dashboard' && (
          <StudentDashboard
            projects={projects}
            batches={batches}
            onRefresh={loadData}
            onOpenNewProject={() => setIsNewProjectOpen(true)}
            onSelectProject={(proj) => setSelectedProject(proj)}
          />
        )}

        {activeTab === 'faculty_dashboard' && (
          <FacultyDashboard
            projects={projects}
            batches={batches}
            onRefresh={loadData}
            onSelectProject={(proj) => setSelectedProject(proj)}
          />
        )}

        {activeTab === 'admin_dashboard' && (
          <AdminDashboard
            projects={projects}
            batches={batches}
            faculty={faculty}
            analytics={analytics}
            onRefresh={loadData}
            onSelectProject={(proj) => setSelectedProject(proj)}
          />
        )}
      </main>

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          batch={selectedBatch}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* New Project Registration Modal */}
      {isNewProjectOpen && (
        <NewProjectModal
          batches={batches}
          faculty={faculty}
          onClose={() => setIsNewProjectOpen(false)}
          onSuccess={() => {
            loadData();
            setActiveTab('showcase');
          }}
        />
      )}

      {/* Authentication & Email Verification Modal */}
      <AuthModal />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-2.5">
            <img
              src="/logo.jpg"
              alt="Campus Project Hub Logo"
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-sm"
            />
            <span className="font-extrabold text-slate-900 text-sm">Campus Project Hub</span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Collaborate • Innovate • Achieve
          </p>
          <p className="text-slate-500 max-w-md text-[11px]">
            Structured academic tracking for 1st, 2nd, 3rd, and 4th Year undergraduate batches. All student projects, milestones, and evaluations in one unified repository.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
