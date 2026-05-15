import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin' },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

adminUserSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('AdminUser', adminUserSchema);
