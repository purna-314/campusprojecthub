import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  email: { type: String, default: '' },
  role: { type: String, default: 'Member' }
}, { _id: false });

const MilestoneSubmissionSchema = new mongoose.Schema({
  status: { type: String, default: 'pending' }, // pending, submitted, needs_revision, graded
  submittedAt: { type: String, default: null },
  fileUrl: { type: String, default: null },
  githubBranch: { type: String, default: null },
  notes: { type: String, default: null },
  score: { type: Number, default: null },
  feedback: { type: String, default: null },
  gradedAt: { type: String, default: null }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  batchId: { type: String, required: true },
  year: { type: Number, required: true },
  yearLabel: { type: String, required: true },
  projectType: { type: String, default: 'Student Project' },
  department: { type: String, default: 'Computer Science & Engineering' },
  domain: { type: String, default: 'General Tech' },
  tags: [{ type: String }],
  abstract: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  demoUrl: { type: String, default: '' },
  status: { type: String, default: 'pending_review' }, // pending_review, approved, needs_revision, completed
  overallScore: { type: Number, default: null },
  mentorId: { type: String, default: null },
  mentorName: { type: String, default: 'Unassigned' },
  teamLead: {
    name: { type: String, required: true },
    rollNo: { type: String, required: true },
    email: { type: String, default: '' }
  },
  teamMembers: [TeamMemberSchema],
  milestoneSubmissions: {
    type: Object,
    default: {}
  },
  featured: { type: Boolean, default: false },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

export const ProjectModel = mongoose.model('Project', ProjectSchema);
