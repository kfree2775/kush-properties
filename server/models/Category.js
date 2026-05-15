import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sortOrder: { type: Number, default: 0 },
});

categorySchema.index({ slug: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
