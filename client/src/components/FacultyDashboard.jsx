import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Send, 
  Edit3, 
  Layers, 
  Check
} from 'lucide-react';
import { api } from '../services/api';

export default function FacultyDashboard({ 
  projects, 
  batches, 
  onRefresh, 
  onSelectProject 
}) {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'all'
  const [gradingModal, setGradingModal] = useState(null); // { project, milestone, milestoneId }
  const [gradeForm, setGradeForm] = useState({
    score: 18,
    status: 'graded',
    feedback: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Projects guided by this faculty
  const myProjects = projects.filter(p => 
    p.mentorId === user?.id || 
    (user?.name && p.mentorName?.includes(user.name.split(' ')[1] || user.name))
  );

  // Collect pending submissions across all my projects
  const pendingSubmissions = [];
  myProjects.forEach(proj => {
    const batch = batches.find(b => b.id === proj.batchId);
    const milestones = batch?.milestones || [];
    milestones.forEach(m => {
      const sub = proj.milestoneSubmissions?.[m.id];
      if (sub && (sub.status === 'submitted' || sub.status === 'needs_revision')) {
        pendingSubmissions.push({
          project: proj,
          milestone: m,
          submission: sub
        });
      }
    });
  });

  const openGrading = (project, milestone) => {
    const sub = project.milestoneSubmissions?.[milestone.id];
    setGradingModal({ project, milestone });
    setGradeForm({
      score: sub?.score ?? Math.round(milestone.weight * 0.85),
      status: 'graded',
      feedback: sub?.feedback || ''
    });
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!gradingModal) return;

    setIsSaving(true);
    try {
      await api.gradeMilestone(
        gradingModal.project.id,
        gradingModal.milestone.id,
        gradeForm
      );
      setGradingModal(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error updating grade: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickApproveProposal = async (projectId) => {
    try {
      await api.updateProject(projectId, { status: 'approved' });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error approving project: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Faculty Profile Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50 border border-slate-200"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                Faculty Guide
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {user.designation} • {user.department}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Official Email: <span className="font-mono text-slate-600">{user.email}</span>
            </p>
          </div>
        </div>

        {/* Mentorship Stats */}
        <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="text-center px-3 border-r border-slate-200">
            <span className="text-xl font-extrabold text-indigo-600">{myProjects.length}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Projects Guided</span>
          </div>
          <div className="text-center px-3">
            <span className="text-xl font-extrabold text-amber-600">{pendingSubmissions.length}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Awaiting Review</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'pending'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Submissions ({pendingSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('all')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Guided Projects ({myProjects.length})</span>
        </button>
      </div>

      {/* Tab 1: Pending Submissions Queue */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">All Student Submissions Reviewed</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are no pending milestone deliverables or SRS documents waiting for your grading right now.
              </p>
            </div>
          ) : (
            pendingSubmissions.map(({ project, milestone, submission }, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-indigo-300 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {project.yearLabel}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {project.domain}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {project.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Team: <strong className="text-slate-700">{project.teamLead?.name}</strong> ({project.teamMembers?.length || 1} members) • Roll: {project.teamLead?.rollNo}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openGrading(project, milestone)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center space-x-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Grade Milestone</span>
                    </button>
                    <button
                      onClick={() => onSelectProject(project)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Milestone Deliverable info */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950">
                      Submitted: {milestone.title} ({milestone.weight}% marks)
                    </span>
                    <span className="text-slate-500">
                      Submitted on: <strong className="text-slate-700">{submission.submittedAt || 'Today'}</strong>
                    </span>
                  </div>

                  {submission.notes && (
                    <p className="text-slate-700">
                      <strong className="text-slate-900">Student notes: </strong>
                      {submission.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {submission.fileUrl && (
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-600 hover:underline font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Submitted Report / Document</span>
                      </a>
                    )}
                    {submission.githubBranch && (
                      <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Branch: {submission.githubBranch}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: All Mentored Projects */}
      {activeSubTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {proj.yearLabel}
                  </span>
                  {proj.status === 'pending_review' ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Proposal Pending Approval
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Approved Project
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {proj.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {proj.abstract}
                </p>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>Lead: <strong className="text-slate-800">{proj.teamLead?.name}</strong> ({proj.teamLead?.rollNo})</p>
                  <p>Batch: <strong className="text-slate-700">{proj.batchId}</strong></p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {proj.status === 'pending_review' && (
                    <button
                      onClick={() => handleQuickApproveProposal(proj.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Topic</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onSelectProject(proj)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                >
                  Manage Milestones
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Milestone Grading & Feedback Modal */}
      {gradingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              Grade Milestone Deliverable
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Project: <strong className="text-slate-800">{gradingModal.project.title}</strong>
            </p>
            <p className="text-xs text-indigo-600 font-semibold">
              Milestone: {gradingModal.milestone.title} (Max: {gradingModal.milestone.weight} points)
            </p>

            <form onSubmit={handleSaveGrade} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marks Awarded (Out of {gradingModal.milestone.weight})
                </label>
                <input
                  type="number"
                  min="0"
                  max={gradingModal.milestone.weight}
                  required
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                  className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evaluation Verdict
                </label>
                <select
                  value={gradeForm.status}
                  onChange={(e) => setGradeForm({ ...gradeForm, status: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="graded">Graded & Accepted</option>
                  <option value="needs_revision">Request Revision / Resubmission</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty Guide Feedback & Suggestions
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide constructive feedback, test recommendations, or revision notes..."
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Submitting...' : 'Save Evaluation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
