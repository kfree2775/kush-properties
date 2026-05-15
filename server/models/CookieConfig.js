import mongoose from 'mongoose';

const cookieConfigSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  bannerText: { type: String, default: 'We use cookies to enhance your browsing experience.' },
  acceptText: { type: String, default: 'Accept' },
  declineText: { type: String, default: 'Decline' },
  policyLinkText: { type: String, default: 'Privacy Policy' },
}, { timestamps: true });

export default mongoose.model('CookieConfig', cookieConfigSchema);
