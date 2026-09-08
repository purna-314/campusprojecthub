import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  Download, 
  RefreshCw, 
  Plus, 
  GraduationCap, 
  Calendar,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminDashboard({ 
  projects, 
  batches, 
  faculty, 
  analytics, 
  onRefresh, 
  onSelectProject 
}) {
  const { user } = useAuth();
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [newBatchForm, setNewBatchForm] = useState({
    name: 'Batch 2025-2029',
    year: 1,
    projectType: 'Freshman Social Innovation & Problem Solving',
    department: 'Computer Science & Engineering',
    academicYear: '2025-2026',
    coordinator: 'Prof. Alan Turing'
  });
  const [isResetting, setIsResetting] = useState(false);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);

  const handleExportCSV = () => {
    if (!projects || projects.length === 0) return;

    const headers = [
      'Project ID',
      'Title',
      'Year',
      'Batch',
      'Department',
      'Domain',
      'Team Lead Name',
      'Team Lead Roll No',
      'Team Members Count',
      'Faculty Mentor',
      'Status',
      'Overall Score (%)',
      'GitHub URL'
    ];

    const rows = projects.map(p => [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.yearLabel || p.year}"`,
      `"${p.batchId}"`,
      `"${p.department}"`,
      `"${p.domain}"`,
      `"${p.teamLead?.name || ''}"`,
      `"${p.teamLead?.rollNo || ''}"`,
      `"${p.teamMembers?.length || 1}"`,
      `"${p.mentorName || 'Unassigned'}"`,
      `"${p.status}"`,
      `"${p.overallScore || 'N/A'}"`,
      `"${p.githubUrl || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `campus_projects_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset all batches and projects to initial demo seed data? Any new edits will be reset.')) return;
    setIsResetting(true);
    try {
      await api.resetData();
      alert('Demo data restored successfully!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Reset failed: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setIsCreatingBatch(true);
    try {
      await api.createBatch(newBatchForm);
      setShowNewBatchModal(false);
      alert('New Academic Batch created successfully!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Batch creation failed: ' + err.message);
    } finally {
      setIsCreatingBatch(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-purple-50 border border-slate-200"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                Department HOD & Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {user.designation} • {user.department}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Institution Oversight & Batch Project Accreditations (NAAC/NBA)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
            title="Export all student project data to CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>

          <button
            onClick={() => setShowNewBatchModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Academic Batch</span>
          </button>

          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
            title="Reset database to demo seed data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Projects</span>
            <FolderKanban className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{analytics?.totalProjects || projects.length}</p>
          <span className="text-[11px] text-slate-500">Across 4 academic years</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active & Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600">
            {projects.filter(p => p.status === 'approved' || p.status === 'completed').length}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">In progress or finished</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Proposals Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600">
            {projects.filter(p => p.status === 'pending_review').length}
          </p>
          <span className="text-[11px] text-slate-500">Awaiting guide approval</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Mentors</span>
            <GraduationCap className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-purple-600">{faculty.length}</p>
          <span className="text-[11px] text-slate-500">Faculty supervisors allocated</span>
        </div>
      </div>

      {/* Year-Wise Breakdown Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Year-Wise & Batch-Wise Project Oversight
            </h3>
            <p className="text-xs text-slate-500">
              Monitoring mandatory project deliverables according to each batch's curriculum stage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(year => {
            const yrProjects = projects.filter(p => p.year === year);
            const yrBatch = batches.find(b => b.year === year);
            const approved = yrProjects.filter(p => p.status === 'approved' || p.status === 'completed').length;
            const pending = yrProjects.filter(p => p.status === 'pending_review').length;

            return (
              <div
                key={year}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-900 text-white">
                      {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-500">
                      {yrBatch?.name || `Batch ${year}`}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 leading-snug">
                    {yrBatch?.projectType || 'Mandatory Academic Project'}
                  </h4>

                  <div className="space-y-1.5 pt-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Teams:</span>
                      <strong className="text-slate-900">{yrProjects.length}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Approved & Active:</span>
                      <strong className="text-emerald-700">{approved}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Pending Reviews:</span>
                      <strong className="text-amber-700">{pending}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400 block truncate">
                    Coordinator: {yrBatch?.coordinator || 'Prof. Alan Turing'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Faculty Guide Load Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Faculty Guide Allocation & Mentorship Load
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Faculty Guide</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4">Active Projects</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faculty.map(f => {
                const guided = projects.filter(p => p.mentorId === f.id || p.mentorName?.includes(f.name.split(' ')[1] || ''));
                return (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-all">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                      <img src={f.avatar} alt={f.name} className="w-7 h-7 rounded-full object-cover" />
                      <span>{f.name}</span>
                    </td>
                    <td className="py-3 px-4">{f.department}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {f.specializations?.slice(0, 2).map((s, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {guided.length} / {f.maxLoad || 6}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {guided.length >= (f.maxLoad || 6) ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                          Capacity Full
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Batch Creation Modal */}
      {showNewBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              Configure New Academic Batch
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new cohort and define mandatory project rules and coordinator.
            </p>

            <form onSubmit={handleCreateBatch} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batch 2025-2029"
                  value={newBatchForm.name}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={newBatchForm.year}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, year: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={1}>1st Year (Freshmen)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Session
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2025-2026"
                    value={newBatchForm.academicYear}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, academicYear: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mandatory Project Track
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Capstone Major Project or Minor Project"
                  value={newBatchForm.projectType}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, projectType: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch Coordinator
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Maya Patel"
                  value={newBatchForm.coordinator}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, coordinator: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewBatchModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm"
                >
                  {isCreatingBatch ? 'Creating...' : 'Save Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
