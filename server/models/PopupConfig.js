import mongoose from 'mongoose';

const popupConfigSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  delaySeconds: { type: Number, default: 30 },
  heading: { type: String, default: 'Get Exclusive Property Updates' },
  subtext: { type: String, default: 'Be the first to know about new launches and special offers.' },
  ctaText: { type: String, default: 'Submit' },
  fields: [{
    name: { type: String, enum: ['fullName', 'email', 'phone'], required: true },
    label: { type: String, required: true },
    required: { type: Boolean, default: true },
  }],
}, { timestamps: true });

export default mongoose.model('PopupConfig', popupConfigSchema);
