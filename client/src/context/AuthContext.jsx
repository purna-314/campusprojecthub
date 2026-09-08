import React, { createContext, useContext, useState } from 'react';

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
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  faculty: {
    role: 'faculty',
    id: 'fac-101',
    name: 'Dr. Sarah Jenkins',
    designation: 'Associate Professor & Project Guide',
    department: 'Computer Science & Engineering',
    email: 's.jenkins@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  admin: {
    role: 'admin',
    id: 'admin-1',
    name: 'Prof. Alan Turing',
    designation: 'Head of Department & Academic Coordinator',
    department: 'Computer Science & Engineering',
    email: 'a.turing@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
};

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState('student'); // 'student' | 'faculty' | 'admin'

  const user = DEMO_PROFILES[currentRole];

  const switchRole = (role) => {
    if (DEMO_PROFILES[role]) {
      setCurrentRole(role);
    }
  };

  return (
    <AuthContext.Provider value={{ currentRole, user, switchRole, DEMO_PROFILES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
