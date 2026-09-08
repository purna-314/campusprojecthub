import mongoose from 'mongoose';

const FacultySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true },
  specializations: [{ type: String }],
  currentLoad: { type: Number, default: 0 },
  maxLoad: { type: Number, default: 6 },
  avatar: { type: String, default: '' }
}, { timestamps: true });

export const FacultyModel = mongoose.model('Faculty', FacultySchema);
