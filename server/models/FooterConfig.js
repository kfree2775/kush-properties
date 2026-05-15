import mongoose from 'mongoose';

const footerConfigSchema = new mongoose.Schema({
  aboutText: { type: String, default: '' },
  columns: [{
    title: { type: String, required: true },
    links: [{
      label: String,
      href: String,
      sortOrder: { type: Number, default: 0 },
    }],
    sortOrder: { type: Number, default: 0 },
  }],
}, { timestamps: true });

export default mongoose.model('FooterConfig', footerConfigSchema);
