import mongoose from 'mongoose';

const navbarConfigSchema = new mongoose.Schema({
  links: [{
    label: { type: String, required: true },
    href: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isExternal: { type: Boolean, default: false },
  }],
  ctaText: { type: String, default: 'Book a Visit' },
  ctaPhone: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('NavbarConfig', navbarConfigSchema);
