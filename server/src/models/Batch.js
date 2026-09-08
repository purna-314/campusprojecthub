import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  weight: { type: Number, required: true },
  dueDate: { type: String, required: true },
  description: { type: String, default: '' }
}, { _id: false });

const BatchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  year: { type: Number, required: true },
  yearLabel: { type: String, required: true },
  projectType: { type: String, required: true },
  department: { type: String, default: 'Computer Science & Engineering' },
  academicYear: { type: String, default: '2024-2025' },
  coordinator: { type: String, default: 'Head of Department' },
  maxTeamSize: { type: Number, default: 4 },
  minTeamSize: { type: Number, default: 1 },
  status: { type: String, default: 'active' },
  milestones: [MilestoneSchema]
}, { timestamps: true });

export const BatchModel = mongoose.model('Batch', BatchSchema);
