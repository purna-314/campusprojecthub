import { 
  X, 
  ExternalLink, 
  Calendar, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Layers, 
  Award, 
  FolderGit2
} from 'lucide-react';
import { GithubIcon } from './Icons';

export default function ProjectDetailsModal({ project, batch, onClose }) {
  if (!project) return null;

  const milestonesList = batch?.milestones || [
    { id: 'm1', title: 'Milestone 1: Synopsis & Proposal', weight: 20, dueDate: '2026-09-30' },
    { id: 'm2', title: 'Milestone 2: System Architecture', weight: 25, dueDate: '2026-10-25' },
    { id: 'm3', title: 'Milestone 3: Mid-Term Demo', weight: 25, dueDate: '2026-11-18' },
    { id: 'm4', title: 'Milestone 4: Final Implementation', weight: 30, dueDate: '2026-12-10' },
  ];

  const getMilestoneStatusBadge = (sub) => {
    if (!sub || sub.status === 'pending') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
          <Clock className="w-3 h-3" />
          <span>Pending</span>
        </span>
      );
    }
    if (sub.status === 'graded') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          <span>Graded ({sub.score} pts)</span>
        </span>
      );
    }
    if (sub.status === 'submitted') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3" />
          <span>Under Evaluation</span>
        </span>
      );
    }
    if (sub.status === 'needs_revision') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
          <AlertCircle className="w-3 h-3" />
          <span>Needs Revision</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
              {project.yearLabel || `${project.year}th Year`}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
              {project.projectType || 'Mandatory Project'}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
              {project.domain}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            {project.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Batch: {batch?.name || project.batchId}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Mentor: {project.mentorName}</span>
            </div>
            {project.overallScore && (
              <div className="flex items-center space-x-1.5 font-bold text-emerald-300">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Score: {project.overallScore}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          {/* Action Links & Quick details */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">No repo provided</span>
              )}

              {project.demoUrl ? (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Product Demo</span>
                </a>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {project.tags?.map((tag, i) => (
                <span key={i} className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Abstract */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Project Abstract & Scope</span>
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              {project.abstract}
            </p>
          </div>

          {/* Team Members */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Team Members ({project.teamMembers?.length || 1})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {project.teamMembers?.map((member, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                    <p className="text-[11px] text-blue-600 font-medium">{member.rollNo}</p>
                    <p className="text-[10px] text-slate-400 truncate">{member.role || 'Member'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Submissions & Evaluation Progression */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Year-Wise Project Milestones & Guide Reviews</span>
            </h4>

            <div className="space-y-3">
              {milestonesList.map((m, idx) => {
                const sub = project.milestoneSubmissions?.[m.id];
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">{m.title}</h5>
                          <span className="text-xs text-slate-500">Weightage: {m.weight}% | Due: {m.dueDate}</span>
                        </div>
                      </div>
                      <div>{getMilestoneStatusBadge(sub)}</div>
                    </div>

                    {/* Submission content details */}
                    {sub && sub.status !== 'pending' ? (
                      <div className="pl-8 space-y-2 text-xs">
                        {sub.notes && (
                          <p className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                            <span className="font-semibold text-slate-800">Student Notes: </span>
                            {sub.notes}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-slate-500">
                          {sub.submittedAt && (
                            <span>Submitted on: <strong className="text-slate-700">{sub.submittedAt}</strong></span>
                          )}
                          {sub.githubBranch && (
                            <span className="inline-flex items-center space-x-1">
                              <FolderGit2 className="w-3 h-3 text-slate-400" />
                              <span>Branch: <code>{sub.githubBranch}</code></span>
                            </span>
                          )}
                        </div>

                        {/* Guide Feedback */}
                        {sub.feedback && (
                          <div className="mt-2 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900">
                            <p className="font-semibold flex items-center space-x-1.5 mb-1">
                              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Guide Feedback ({project.mentorName}):</span>
                            </p>
                            <p className="text-xs text-indigo-800">{sub.feedback}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="pl-8 text-xs text-slate-400 italic">
                        Not yet submitted by the student team.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
