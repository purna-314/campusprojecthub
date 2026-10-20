import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FolderKanban, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Users, 
  GraduationCap, 
  Send, 
  FileCheck, 
  Award,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentDashboard({ 
  projects, 
  batches, 
  onRefresh, 
  onOpenNewProject,
  onSelectProject 
}) {
  const { user } = useAuth();
  const [submittingMilestoneId, setSubmittingMilestoneId] = useState(null);
  const [submitForm, setSubmitForm] = useState({
    fileUrl: '',
    githubBranch: 'main',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Find user's project (matching team lead or member email/rollNo) - ONLY uploaded student projects
  const myProjects = projects.filter(p => 
    (user?.rollNo && (p.teamLead?.rollNo === user?.rollNo || p.teamMembers?.some(m => m.rollNo === user?.rollNo))) ||
    (user?.email && (p.teamLead?.email?.toLowerCase() === user?.email?.toLowerCase() || p.teamMembers?.some(m => m.email?.toLowerCase() === user?.email?.toLowerCase())))
  );

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const myProject = (selectedProjectId ? myProjects.find(p => p.id === selectedProjectId) : myProjects[0]) || null;

  const currentBatch = batches.find(b => b.id === myProject?.batchId) || batches[batches.length - 1];
  const milestones = currentBatch?.milestones || [];

  const handleOpenSubmit = (milestoneId) => {
    setSubmittingMilestoneId(milestoneId);
    setSubmitForm({
      fileUrl: myProject.milestoneSubmissions?.[milestoneId]?.fileUrl || '',
      githubBranch: myProject.milestoneSubmissions?.[milestoneId]?.githubBranch || 'main',
      notes: myProject.milestoneSubmissions?.[milestoneId]?.notes || ''
    });
    setSuccessMessage('');
  };

  const handleSubmitMilestone = async (e) => {
    e.preventDefault();
    if (!myProject || !submittingMilestoneId) return;

    setIsSubmitting(true);
    try {
      await api.submitMilestone(myProject.id, submittingMilestoneId, submitForm);
      setSuccessMessage('Milestone submitted successfully to faculty guide!');
      setSubmittingMilestoneId(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Student Profile & Year Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-50 border border-slate-200"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {user.yearLabel || '4th Year'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Roll No: <strong className="text-slate-700 font-mono">{user.rollNo}</strong> • {user.department}
            </p>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">
              Current Academic Batch: {user.batchName || 'Batch 2021-2025'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenNewProject}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <FolderKanban className="w-4 h-4" />
            <span>Register Another Project</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Multi-Project Switcher if student has uploaded multiple projects */}
      {myProjects.length > 1 && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center space-x-2 overflow-x-auto shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Your Uploaded Projects:</span>
          {myProjects.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                myProject?.id === p.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>{p.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Project Overview Card */}
      {myProject ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  {myProject.yearLabel}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white">
                  {myProject.domain}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">{myProject.title}</h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {myProject.abstract}
              </p>
            </div>

            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2">
                {myProject.overallScore && (
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">Grade</span>
                    <span className="text-2xl font-black text-emerald-400">{myProject.overallScore}%</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => onSelectProject(myProject)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
              >
                Full Project View
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Guide & Team info bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">Assigned Faculty Mentor</span>
                  <span className="text-slate-800 font-bold text-sm">{myProject.mentorName}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">Team Roster</span>
                  <span className="text-slate-800 font-medium">
                    {myProject.teamMembers?.map(m => m.name).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Year-Wise Project Milestones Stepper */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Mandatory Milestone Submissions
                  </h4>
                  <p className="text-xs text-slate-500">
                    All milestones must be reviewed and approved by your assigned faculty guide.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {milestones.map((m, idx) => {
                  const sub = myProject.milestoneSubmissions?.[m.id];
                  const isSubmitted = sub && sub.status === 'submitted';
                  const isGraded = sub && sub.status === 'graded';
                  const isRevision = sub && sub.status === 'needs_revision';
                  const isPending = !sub || sub.status === 'pending';

                  return (
                    <div
                      key={m.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="text-sm font-bold text-slate-900">{m.title}</h5>
                              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                {m.weight}% Marks
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Due Date: <strong className="text-slate-600">{m.dueDate}</strong></p>
                          </div>
                        </div>

                        {/* Status / Action */}
                        <div className="flex items-center space-x-2">
                          {isGraded && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Score: {sub.score} pts</span>
                            </span>
                          )}

                          {isSubmitted && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span>Under Faculty Review</span>
                            </span>
                          )}

                          {isRevision && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Revision Requested</span>
                            </span>
                          )}

                          {(isPending || isRevision) && (
                            <button
                              onClick={() => handleOpenSubmit(m.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center space-x-1"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>{isRevision ? 'Resubmit' : 'Submit Work'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details of previous submission or feedback */}
                      {sub && sub.status !== 'pending' && (
                        <div className="pl-10 space-y-2 text-xs">
                          {sub.notes && (
                            <p className="text-slate-600 bg-slate-50 p-2 rounded-xl">
                              <strong className="text-slate-700">Your notes:</strong> {sub.notes}
                            </p>
                          )}
                          {sub.fileUrl && (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 text-blue-600 hover:underline font-medium"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>View Submitted Deliverable / PDF</span>
                            </a>
                          )}
                          {sub.feedback && (
                            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900">
                              <span className="font-bold block mb-0.5">Faculty Feedback:</span>
                              <p>{sub.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Inline Submission Form */}
                      {submittingMilestoneId === m.id && (
                        <form onSubmit={handleSubmitMilestone} className="mt-4 p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4 animate-in fade-in">
                          <h6 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                            Submit Deliverables for: {m.title}
                          </h6>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Document / PDF / Drive Link
                              </label>
                              <input
                                type="url"
                                required
                                placeholder="https://drive.google.com/... or https://..."
                                value={submitForm.fileUrl}
                                onChange={(e) => setSubmitForm({ ...submitForm, fileUrl: e.target.value })}
                                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                GitHub Branch / Tag
                              </label>
                              <input
                                type="text"
                                placeholder="main or v1.0"
                                value={submitForm.githubBranch}
                                onChange={(e) => setSubmitForm({ ...submitForm, githubBranch: e.target.value })}
                                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Submission Summary & Notes for Mentor
                            </label>
                            <textarea
                              rows={2}
                              required
                              placeholder="Describe deliverables completed, test results, or changes made..."
                              value={submitForm.notes}
                              onChange={(e) => setSubmitForm({ ...submitForm, notes: e.target.value })}
                              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-center justify-end space-x-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setSubmittingMilestoneId(null)}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center space-x-1.5 shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isSubmitting ? 'Uploading...' : 'Confirm Submission'}</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Registered Project Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Every student batch must register a project for this academic year. Submit your project charter or proposal now to begin mentoring.
          </p>
          <button
            onClick={onOpenNewProject}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
          >
            Register Project Proposal
          </button>
        </div>
      )}

      {/* Academic Year Guidelines Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-200/60 text-slate-800">
        <h4 className="text-sm font-bold text-blue-900 flex items-center space-x-2 mb-2">
          <Award className="w-4 h-4 text-blue-600" />
          <span>Academic Batch Project Requirements Guide</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 text-xs">
          <div className="p-3 rounded-2xl bg-white/80 border border-blue-100">
            <span className="font-bold text-emerald-700 block">1st Year</span>
            <p className="text-slate-600 mt-1">Community problem identification, social impact empathy study, and low-fidelity prototype.</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/80 border border-blue-100">
            <span className="font-bold text-amber-700 block">2nd Year</span>
            <p className="text-slate-600 mt-1">Minor hardware or software project focusing on data modeling and architectural specs.</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/80 border border-blue-100">
            <span className="font-bold text-cyan-700 block">3rd Year</span>
            <p className="text-slate-600 mt-1">Domain specialization (AI, IoT, Cloud, Security) with research literature review & prototype.</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/80 border border-blue-100">
            <span className="font-bold text-purple-700 block">4th Year</span>
            <p className="text-slate-600 mt-1">Capstone major project with industry guide, external viva defense, and publishable paper.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
