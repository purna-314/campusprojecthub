import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const DEMO_PROFILES = {
  student: {
    role: 'student',
    id: 'user-student-1',
    name: 'Alex Rivera',
    rollNo: '21CS042',
    email: 'alex.rivera@student.campus.edu',
    year: 4,
    yearLabel: '4th Year (Senior)',
    batchId: 'batch-2021-2025',
    batchName: 'Batch 2021-2025',
    department: 'Computer Science & Engineering',
    designation: 'Undergraduate Senior Researcher',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  faculty: {
    role: 'faculty',
    id: 'fac-101',
    name: 'Dr. Sarah Jenkins',
    designation: 'Associate Professor & Project Guide',
    department: 'Computer Science & Engineering',
    email: 's.jenkins@campus.edu',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  admin: {
    role: 'admin',
    id: 'admin-1',
    name: 'Prof. Alan Turing',
    designation: 'Head of Department & Academic Coordinator',
    department: 'Computer Science & Engineering',
    email: 'a.turing@campus.edu',
    isVerified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register' | 'verify' | 'forgot'
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [devVerificationNotice, setDevVerificationNotice] = useState(null); // { code, previewUrl }

  // Load session on startup
  useEffect(() => {
    async function loadSession() {
      try {
        const storedToken = getAuthToken();
        if (storedToken) {
          const profile = await api.auth.getMe();
          if (profile) {
            setUser(profile);
            setToken(storedToken);
          } else {
            setUser(null);
            setToken(null);
          }
        } else {
          // If no stored token, default to Demo Student view for preview convenience
          setUser(DEMO_PROFILES.student);
        }
      } catch (err) {
        console.error('Session loading failed:', err);
        setUser(DEMO_PROFILES.student);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();

    // Check URL parameters for direct verification link (?verifyEmail=...&code=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const verifyEmail = params.get('verifyEmail');
      const verifyCode = params.get('code');
      if (verifyEmail) {
        setPendingVerificationEmail(verifyEmail);
        setAuthModalTab('verify');
        setIsAuthModalOpen(true);
        if (verifyCode) {
          // Auto trigger verification if code is present in URL
          api.auth.verifyEmail({ email: verifyEmail, code: verifyCode })
            .then(res => {
              if (res.user) {
                setUser(res.user);
                setToken(res.token);
                setIsAuthModalOpen(false);
                // Clean URL params
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            })
            .catch(e => {
              console.warn('URL auto-verification error:', e);
            });
        }
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }, []);

  const openAuthModal = (tab = 'login', email = '') => {
    setAuthModalTab(tab);
    if (email) setPendingVerificationEmail(email);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (credentials) => {
    try {
      const res = await api.auth.login(credentials);
      setUser(res.user);
      setToken(res.token);
      setIsAuthModalOpen(false);
      setDevVerificationNotice(null);
      return res;
    } catch (err) {
      if (err.unverified) {
        setPendingVerificationEmail(err.email);
        setDevVerificationNotice({ code: err.devCode, previewUrl: err.previewUrl });
        setAuthModalTab('verify');
        setIsAuthModalOpen(true);
      }
      throw err;
    }
  };

  const register = async (formData) => {
    const res = await api.auth.register(formData);
    setPendingVerificationEmail(res.email);
    setDevVerificationNotice({ code: res.devCode, previewUrl: res.previewUrl });
    setAuthModalTab('verify');
    setIsAuthModalOpen(true);
    return res;
  };

  const verifyEmail = async ({ email, code }) => {
    const res = await api.auth.verifyEmail({ email, code });
    if (res.user) {
      setUser(res.user);
      setToken(res.token);
      setIsAuthModalOpen(false);
      setDevVerificationNotice(null);
    }
    return res;
  };

  const resendVerification = async (email) => {
    const res = await api.auth.resendVerification(email || pendingVerificationEmail);
    if (res.devCode) {
      setDevVerificationNotice({ code: res.devCode, previewUrl: res.previewUrl });
    }
    return res;
  };

  const logout = () => {
    api.auth.logout();
    setToken(null);
    // Revert to demo student
    setUser(DEMO_PROFILES.student);
  };

  // 1-Click quick login for testing predefined demo roles
  const quickLogin = async (roleKey) => {
    const demo = DEMO_PROFILES[roleKey];
    if (!demo) return;
    try {
      const res = await api.auth.login({
        email: demo.email,
        password: 'Password123!'
      });
      setUser(res.user);
      setToken(res.token);
    } catch (err) {
      // Fallback to local profile state if server is not reachable
      setUser(demo);
    }
  };

  const switchRole = (roleKey) => {
    quickLogin(roleKey);
  };

  const currentRole = user?.role || 'student';
  const isAuthenticated = Boolean(token && getAuthToken());

  return (
    <AuthContext.Provider
      value={{
        user: user || DEMO_PROFILES.student,
        currentRole,
        token,
        isAuthenticated,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        pendingVerificationEmail,
        devVerificationNotice,
        setAuthModalTab,
        setPendingVerificationEmail,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        verifyEmail,
        resendVerification,
        logout,
        quickLogin,
        switchRole,
        DEMO_PROFILES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
