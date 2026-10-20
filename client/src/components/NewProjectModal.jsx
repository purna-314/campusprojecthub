import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  FolderPlus, 
  Users, 
  GraduationCap, 
  Globe, 
  Tag,
  Calendar
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function NewProjectModal({ batches, faculty, onClose, onSuccess }) {
  const { user } = useAuth();

  const defaultBatchAndYear = user?.batchName
    ? `${user.batchName} (${user.yearLabel || ''})`
    : (batches[batches.length - 1]?.name ? `${batches[batches.length - 1].name} — ${batches[batches.length - 1].yearLabel}` : '');

  const [formData, setFormData] = useState({
    title: '',
    batchAndYear: defaultBatchAndYear,
    domain: 'AI / Machine Learning',
    tags: 'React, Node.js, TailwindCSS',
    abstract: '',
    githubUrl: '',
    demoUrl: '',
    supervisor: faculty[0]?.name || '',
    teamLead: {
      name: user?.name || '',
      rollNo: user?.rollNo || '',
      email: user?.email || ''
    },
    teamMembers: [
      { name: user?.name || '', rollNo: user?.rollNo || '', email: user?.email || '', role: 'Team Lead' }
    ]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const domains = [
    'AI / Machine Learning',
    'Web & Cloud Systems',
    'Mobile Application Development',
    'IoT & Embedded Systems',
    'CyberSecurity & Forensics',
    'Blockchain & Distributed Ledgers',
    'Data Science & Analytics',
    'Social Innovation & Community Impact',
    'Robotics & Automation'
  ];

  const handleAddMember = () => {
    setFormData({
      ...formData,
      teamMembers: [
        ...formData.teamMembers,
        { name: '', rollNo: '', email: '', role: 'Developer' }
      ]
    });
  };

  const handleRemoveMember = (index) => {
    if (formData.teamMembers.length <= 1) return;
    const updated = formData.teamMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, teamMembers: updated });
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...formData.teamMembers];
    updated[index][field] = value;
    if (index === 0 && (field === 'name' || field === 'rollNo' || field === 'email')) {
      // Update teamLead sync
      setFormData({
        ...formData,
        teamLead: {
          ...formData.teamLead,
          [field]: value
        },
        teamMembers: updated
      });
    } else {
      setFormData({ ...formData, teamMembers: updated });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.batchAndYear) {
      alert('Project Title and Batch & Year are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find matching batch if available to preserve batchId linkage
      const matchedBatch = batches.find(b => 
        formData.batchAndYear.toLowerCase().includes(b.id.toLowerCase()) ||
        formData.batchAndYear.toLowerCase().includes(b.name.toLowerCase()) ||
        b.name.toLowerCase().includes(formData.batchAndYear.toLowerCase())
      );

      // Find matching faculty if available to preserve mentorId linkage
      const matchedFaculty = faculty.find(f => 
        formData.supervisor && (
          f.name.toLowerCase() === formData.supervisor.toLowerCase() ||
          f.name.toLowerCase().includes(formData.supervisor.toLowerCase()) ||
          formData.supervisor.toLowerCase().includes(f.name.toLowerCase())
        )
      );

      const payload = {
        ...formData,
        batchId: matchedBatch ? matchedBatch.id : formData.batchAndYear,
        batchAndYear: formData.batchAndYear,
        mentorId: matchedFaculty ? matchedFaculty.id : null,
        mentorName: formData.supervisor || (matchedFaculty ? matchedFaculty.name : 'Unassigned'),
        supervisor: formData.supervisor,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      await api.createProject(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert('Error registering project: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 sm:p-8 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-100 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Project Registration Form</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              Register Student Batch Project
            </h3>
            <p className="text-xs text-blue-100 mt-1">
              Submit your team proposal, assign members, and choose a faculty supervisor.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Year & Batch Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Target Academic Batch & Year *</span>
              </label>
              <input
                type="text"
                required
                list="batch-suggestions"
                placeholder="e.g. Batch 2021-2025 (4th Year) or Batch 2024-2028"
                value={formData.batchAndYear}
                onChange={(e) => setFormData({ ...formData, batchAndYear: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <datalist id="batch-suggestions">
                {batches.map(b => (
                  <option key={b.id} value={`${b.name} — ${b.yearLabel}`} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Project Domain / Area *
              </label>
              <select
                required
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {domains.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Autonomous Campus Navigation and Accessibility Assistant"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          {/* Abstract */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Project Abstract / Synopsis *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Detail the problem statement, proposed methodology, target beneficiaries, and expected outcomes..."
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags & Faculty Guide Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Tech Stack / Keywords (comma separated)</span>
              </label>
              <input
                type="text"
                placeholder="Python, PyTorch, React, Docker, ESP32"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Preferred Faculty Guide / Supervisor</span>
              </label>
              <input
                type="text"
                list="faculty-suggestions"
                placeholder="e.g. Dr. Sarah Jenkins or Prof. Alan Turing"
                value={formData.supervisor}
                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <datalist id="faculty-suggestions">
                {faculty.map(f => (
                  <option key={f.id} value={f.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* External Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <GithubIcon className="w-3.5 h-3.5 text-slate-700" />
                <span>GitHub Repository URL (Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Live Demo URL (Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://myproject.demo.campus.edu"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Team Members Roster */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Team Roster (Batch Students)</span>
              </label>
              <button
                type="button"
                onClick={handleAddMember}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-all flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.teamMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 items-center"
                >
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Student Full Name"
                      value={member.name}
                      onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Roll No (e.g. 21CS042)"
                      value={member.rollNo}
                      onChange={(e) => handleMemberChange(idx, 'rollNo', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Role (e.g. Frontend/ML)"
                      value={member.role}
                      onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      placeholder="Email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    />
                    {formData.teamMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : 'Register Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
