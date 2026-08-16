import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  suffix: { type: String, default: '' },
  label: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  sortOrder: { type: Number, default: 0 },
});

export default mongoose.model('Achievement', achievementSchema);
