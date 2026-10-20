import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FolderKanban, 
  UserCheck, 
  PlusCircle, 
  Layers, 
  BarChart3, 
  ShieldCheck,
  LogIn,
  LogOut,
  UserPlus,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  MailCheck
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenNewProject }) {
  const { 
    currentRole, 
    user, 
    switchRole, 
    isAuthenticated, 
    openAuthModal, 
    logout 
  } = useAuth();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & College Info */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('showcase')}
          >
            <div className="relative">
              <img
                src="/logo.jpg"
                alt="Campus Project Hub Logo"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200"
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

          {/* Center Nav Tabs */}
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

          {/* Right Action Area */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Action Button */}
            <button
              onClick={onOpenNewProject}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Project</span>
            </button>

            {/* If Authenticated: User Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 pl-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-all text-left"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-300"
                  />
                  <div className="hidden lg:block text-left pr-1">
                    <div className="text-xs font-bold text-slate-800 leading-tight flex items-center space-x-1">
                      <span>{user.name}</span>
                      {user.isVerified && (
                        <MailCheck className="w-3 h-3 text-emerald-600 inline" title="Email Verified" />
                      )}
                    </div>
                    <span className="text-[10px] text-blue-600 font-semibold capitalize">
                      {user.role} {user.year ? `(${user.yearLabel || `${user.year} Year`})` : ''}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Profile Menu Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                      <div className="text-slate-500 text-xs truncate">{user.email}</div>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Email Verified</span>
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 uppercase">
                          {user.role}
                        </span>
                      </div>
                      {user.rollNo && (
                        <div className="mt-1.5 text-[11px] text-slate-500">
                          Roll No: <span className="font-semibold text-slate-700">{user.rollNo}</span>
                        </div>
                      )}
                      {user.department && (
                        <div className="text-[11px] text-slate-500 truncate">
                          Dept: <span className="font-semibold text-slate-700">{user.department}</span>
                        </div>
                      )}
                    </div>

                    {/* Switch role preview shortcuts */}
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Test Role Persona:
                      </p>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => {
                            switchRole('student');
                            setActiveTab('student_dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className={`flex-1 py-1 rounded-lg text-[11px] font-semibold border ${
                            currentRole === 'student'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          🎓 Student
                        </button>
                        <button
                          onClick={() => {
                            switchRole('faculty');
                            setActiveTab('faculty_dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className={`flex-1 py-1 rounded-lg text-[11px] font-semibold border ${
                            currentRole === 'faculty'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          👩‍🏫 Faculty
                        </button>
                        <button
                          onClick={() => {
                            switchRole('admin');
                            setActiveTab('admin_dashboard');
                            setProfileDropdownOpen(false);
                          }}
                          className={`flex-1 py-1 rounded-lg text-[11px] font-semibold border ${
                            currentRole === 'admin'
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          🏛️ HOD
                        </button>
                      </div>
                    </div>

                    {/* Logout */}
                    <div className="px-2 pt-1.5">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                          setActiveTab('showcase');
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If Not Authenticated: Sign In / Register Buttons */
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => openAuthModal('register')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Register</span>
                </button>

                {/* Role Switcher Pill Container for Guest / Demo Explorer */}
                <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 ml-1">
                  <button
                    onClick={() => {
                      switchRole('student');
                      setActiveTab('student_dashboard');
                    }}
                    title="Quick preview as Alex Rivera (4th Year Student)"
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                      currentRole === 'student'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>🎓</span>
                    <span>Student</span>
                  </button>

                  <button
                    onClick={() => {
                      switchRole('faculty');
                      setActiveTab('faculty_dashboard');
                    }}
                    title="Quick preview as Dr. Sarah Jenkins (Faculty Guide)"
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                      currentRole === 'faculty'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>👩‍🏫</span>
                    <span>Faculty</span>
                  </button>

                  <button
                    onClick={() => {
                      switchRole('admin');
                      setActiveTab('admin_dashboard');
                    }}
                    title="Quick preview as Prof. Alan Turing (HOD / Admin)"
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                      currentRole === 'admin'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>🏛️</span>
                    <span>HOD</span>
                  </button>
                </div>
              </div>
            )}
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
