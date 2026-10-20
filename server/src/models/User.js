import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['student', 'faculty', 'admin'], 
      default: 'student', 
      required: true 
    },
    // Student-specific fields
    rollNo: { type: String, trim: true, default: '' },
    year: { type: Number, enum: [1, 2, 3, 4], default: 1 },
    yearLabel: { type: String, default: '1st Year' },
    batchId: { type: String, default: '' },
    batchName: { type: String, default: '' },
    // Common / Faculty fields
    department: { type: String, default: 'Computer Science & Engineering' },
    designation: { type: String, default: '' },
    avatar: { type: String, default: '' },
    
    // Verification & Security
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null },
    verificationToken: { type: String, default: null },
    verificationExpires: { type: Date, default: null },
    
    // Password Reset
    resetPasswordCode: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { 
    timestamps: true 
  }
);

// Method to sanitize user for frontend consumption (hide password & sensitive tokens)
UserSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationCode;
  delete obj.verificationToken;
  delete obj.resetPasswordCode;
  delete obj.resetPasswordExpires;
  return obj;
};

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
