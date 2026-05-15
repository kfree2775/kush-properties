import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  agreedTc: { type: Boolean, default: false },
  propertyInterest: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  source: { type: String, default: 'popup' },
  contacted: { type: Boolean, default: false },
}, { timestamps: true });

leadSchema.index({ createdAt: -1 });
leadSchema.index({ contacted: 1 });

export default mongoose.model('Lead', leadSchema);
