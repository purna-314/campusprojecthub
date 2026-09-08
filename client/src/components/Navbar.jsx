import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  FolderKanban, 
  UserCheck, 
  ShieldCheck, 
  PlusCircle, 
  Layers, 
  BarChart3, 
  Sparkles 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenNewProject }) {
  const { currentRole, user, switchRole, DEMO_PROFILES } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & College Info */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('showcase')}>
            <div className="relative">
              <img
                src="/logo.jpg"
                alt="Campus Project Hub Logo"
                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Campus Project Hub
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                  Year-Wise
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:block">
                Collaborate • Innovate • Achieve
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('showcase')}
              className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'showcase'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Project Hub</span>
            </button>

            {currentRole === 'student' && (
              <button
                onClick={() => setActiveTab('student_dashboard')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'student_dashboard'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>My Team Project</span>
              </button>
            )}

            {currentRole === 'faculty' && (
              <button
                onClick={() => setActiveTab('faculty_dashboard')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'faculty_dashboard'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Faculty Review</span>
              </button>
            )}

            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveTab('admin_dashboard')}
                className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'admin_dashboard'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>HOD & Year Stats</span>
              </button>
            )}
          </nav>

          {/* Right Area: Role Switcher & New Project Action */}
          <div className="flex items-center space-x-3">
            {/* Quick Action Button */}
            <button
              onClick={onOpenNewProject}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Project</span>
            </button>

            {/* Role Switcher Pill Container */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 hidden lg:inline">
                Switch Role:
              </span>
              <button
                onClick={() => {
                  switchRole('student');
                  setActiveTab('student_dashboard');
                }}
                title="Switch to Student View (Alex Rivera - 4th Year)"
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'student'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🎓</span>
                <span className="hidden sm:inline">Student</span>
              </button>

              <button
                onClick={() => {
                  switchRole('faculty');
                  setActiveTab('faculty_dashboard');
                }}
                title="Switch to Faculty Guide View (Dr. Sarah Jenkins)"
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'faculty'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>👩‍🏫</span>
                <span className="hidden sm:inline">Faculty</span>
              </button>

              <button
                onClick={() => {
                  switchRole('admin');
                  setActiveTab('admin_dashboard');
                }}
                title="Switch to HOD / Admin View (Prof. Alan Turing)"
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🏛️</span>
                <span className="hidden sm:inline">HOD</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('showcase')}
            className={`flex items-center space-x-1 py-1 px-2 rounded font-medium ${
              activeTab === 'showcase' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Showcase</span>
          </button>
          {currentRole === 'student' && (
            <button
              onClick={() => setActiveTab('student_dashboard')}
              className={`flex items-center space-x-1 py-1 px-2 rounded font-medium ${
                activeTab === 'student_dashboard' ? 'text-blue-600 font-bold' : 'text-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>My Project</span>
            </button>
          )}
          {currentRole === 'faculty' && (
            <button
              onClick={() => setActiveTab('faculty_dashboard')}
              className={`flex items-center space-x-1 py-1 px-2 rounded font-medium ${
                activeTab === 'faculty_dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-600'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Reviews</span>
            </button>
          )}
          {currentRole === 'admin' && (
            <button
              onClick={() => setActiveTab('admin_dashboard')}
              className={`flex items-center space-x-1 py-1 px-2 rounded font-medium ${
                activeTab === 'admin_dashboard' ? 'text-purple-600 font-bold' : 'text-slate-600'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>HOD Stats</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
