import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  publicId: { type: String, default: '' },
  headline: { type: String, default: '' },
  subtext: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' },
  secondaryCtaText: { type: String, default: '' },
  secondaryCtaLink: { type: String, default: '' },
  sortOrder: { type: Number, default: 0, index: true },
}, { timestamps: true });



export default mongoose.model('Slide', slideSchema);
