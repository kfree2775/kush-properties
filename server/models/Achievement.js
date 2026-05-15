import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  number: { type: String, required: true },
  label: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  sortOrder: { type: Number, default: 0 },
});

export default mongoose.model('Achievement', achievementSchema);
