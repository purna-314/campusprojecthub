import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  ExternalLink, 
  Heart, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users, 
  GraduationCap, 
  Tag, 
  Compass
} from 'lucide-react';
import { api } from '../services/api';

export default function Showcase({ 
  projects, 
  batches, 
  loading, 
  onSelectProject, 
  onRefresh 
}) {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likingId, setLikingId] = useState(null);

  const years = [
    { value: 'all', label: 'All Years' },
    { value: '1', label: '1st Year', sub: 'Social Innovation' },
    { value: '2', label: '2nd Year', sub: 'Minor Projects' },
    { value: '3', label: '3rd Year', sub: 'Mini Projects' },
    { value: '4', label: '4th Year', sub: 'Capstone Major' },
  ];

  // Extract unique domains
  const domains = ['all', ...Array.from(new Set(projects.map(p => p.domain).filter(Boolean)))];

  // Filter projects
  const filteredProjects = projects.filter(p => {
    if (selectedYear !== 'all' && String(p.year) !== String(selectedYear)) {
      return false;
    }
    if (selectedBatch !== 'all' && p.batchId !== selectedBatch) {
      return false;
    }
    if (selectedDomain !== 'all' && p.domain !== selectedDomain) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = p.title.toLowerCase().includes(q);
      const inAbstract = p.abstract.toLowerCase().includes(q);
      const inLead = p.teamLead?.name?.toLowerCase().includes(q) || p.teamLead?.rollNo?.toLowerCase().includes(q);
      const inTags = p.tags?.some(t => t.toLowerCase().includes(q));
      const inGuide = p.mentorName?.toLowerCase().includes(q);
      return inTitle || inAbstract || inLead || inTags || inGuide;
    }
    return true;
  });

  const handleLike = async (e, projectId) => {
    e.stopPropagation();
    if (likingId) return;
    setLikingId(projectId);
    try {
      await api.likeProject(projectId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLikingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved & Active</span>
          </span>
        );
      case 'needs_revision':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            <span>Revision Required</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3" />
            <span>Proposal In Review</span>
          </span>
        );
    }
  };

  const getYearBadgeStyle = (year) => {
    switch (Number(year)) {
      case 1:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 2:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 3:
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 4:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-200 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Campus Innovation & Research Repository</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Every Batch. Every Year. Built for Impact.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Explore academic projects from 1st Year Social Impact through 4th Year Capstone engineering achievements. Discover student innovations, live demos, code repositories, and milestone evaluations.
            </p>

            {/* Search bar inside Hero */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by project name, tech stack (e.g. PyTorch, IoT), student name..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Official Logo Display Card */}
          <div className="hidden lg:flex flex-shrink-0 flex-col items-center">
            <div className="p-2.5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden max-w-[290px] group hover:bg-white/15 transition-all">
              <img
                src="/logo.jpg"
                alt="Campus Project Hub Logo"
                className="w-full h-auto rounded-2xl object-cover shadow-md"
              />
              <div className="text-center pt-2 pb-1">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-blue-200">
                  Collaborate • Innovate • Achieve
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/2 bottom-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Year Tabs Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {years.map((y) => {
          const isActive = selectedYear === y.value;
          return (
            <button
              key={y.value}
              onClick={() => setSelectedYear(y.value)}
              className={`flex-shrink-0 flex flex-col items-start px-4 py-2.5 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-1.5 font-semibold text-sm">
                <span>{y.label}</span>
              </div>
              {y.sub && (
                <span className={`text-[11px] font-normal ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {y.sub}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Batch Selector */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.yearLabel})
              </option>
            ))}
          </select>

          {/* Domain Selector */}
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Domains</option>
            {domains.filter(d => d !== 'all').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Results Counter */}
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredProjects.length}</span> projects
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Projects Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No student projects match your selected filters. Try broadening your search or switching academic year.
          </p>
          <button
            onClick={() => {
              setSelectedYear('all');
              setSelectedBatch('all');
              setSelectedDomain('all');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="group bg-white rounded-3xl border border-slate-200/80 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              <div className="p-6 space-y-4">
                {/* Card Top: Year & Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getYearBadgeStyle(project.year)}`}>
                    {project.yearLabel || `${project.year}th Year`}
                  </span>
                  {getStatusBadge(project.status)}
                </div>

                {/* Domain & Title */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {project.domain}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {project.title}
                  </h3>
                </div>

                {/* Abstract snippet */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {project.abstract}
                </p>

                {/* Tech Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.slice(0, 4).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">
                        +{project.tags.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Team & Guide & Actions */}
              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                {/* Team Lead & Guide */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-800 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{project.teamLead?.name} ({project.teamMembers?.length || 1})</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[140px]">{project.mentorName}</span>
                  </div>
                </div>

                {/* Interaction / Links */}
                <div className="flex items-center space-x-2">
                  {/* Score badge if available */}
                  {project.overallScore && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                      {project.overallScore}%
                    </span>
                  )}

                  {/* Upvote button */}
                  <button
                    onClick={(e) => handleLike(e, project.id)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all text-xs font-semibold"
                    title="Appreciate Project"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>{project.likes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
