import mongoose from 'mongoose';

const seedVersionSchema = new mongoose.Schema({
  version: { type: Number, required: true, unique: true },
  appliedAt: { type: Date, default: Date.now },
});

export default mongoose.model('SeedVersion', seedVersionSchema);
