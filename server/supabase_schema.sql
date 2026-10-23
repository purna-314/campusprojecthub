-- =============================================================================
-- Campus Project Hub — Supabase PostgreSQL Schema
-- =============================================================================
-- Copy and run this script inside your Supabase Project:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =============================================================================

-- 1. Batches Table
CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER,
  "yearLabel" TEXT,
  "projectType" TEXT,
  department TEXT,
  "academicYear" TEXT,
  coordinator TEXT,
  "maxTeamSize" INTEGER DEFAULT 4,
  "minTeamSize" INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  milestones JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  designation TEXT,
  department TEXT,
  specialization TEXT,
  avatar TEXT,
  "currentLoad" INTEGER DEFAULT 0,
  "maxCapacity" INTEGER DEFAULT 5,
  "areasOfInterest" JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active'
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  "rollNo" TEXT,
  year INTEGER,
  "yearLabel" TEXT,
  "batchId" TEXT,
  "batchName" TEXT,
  department TEXT,
  designation TEXT,
  avatar TEXT,
  "isVerified" BOOLEAN DEFAULT FALSE,
  "verificationCode" TEXT,
  "verificationExpires" TIMESTAMPTZ,
  "verificationToken" TEXT,
  "resetPasswordCode" TEXT,
  "resetPasswordExpires" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  "batchId" TEXT REFERENCES batches(id) ON DELETE SET NULL,
  year INTEGER,
  "yearLabel" TEXT,
  "projectType" TEXT,
  department TEXT,
  domain TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  abstract TEXT,
  "githubUrl" TEXT,
  "demoUrl" TEXT,
  status TEXT DEFAULT 'pending_review',
  "overallScore" NUMERIC,
  "mentorId" TEXT REFERENCES faculty(id) ON DELETE SET NULL,
  "mentorName" TEXT,
  "teamLead" JSONB DEFAULT '{}'::jsonb,
  "teamMembers" JSONB DEFAULT '[]'::jsonb,
  "milestoneSubmissions" JSONB DEFAULT '{}'::jsonb,
  featured BOOLEAN DEFAULT FALSE,
  likes INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_batchId ON projects("batchId");
CREATE INDEX IF NOT EXISTS idx_projects_year ON projects(year);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_mentorId ON projects("mentorId");

-- Disable Row Level Security (RLS) so the Express backend API has full access to manage data
-- (Authentication & authorization are enforced securely by your Express server & JWT)
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS faculty DISABLE ROW LEVEL SECURITY;
