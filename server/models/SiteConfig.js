import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema({
  branding: {
    companyName: { type: String, default: 'KushProperties' },
    tagline: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    logoPublicId: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    faviconPublicId: { type: String, default: '' },
  },
  contact: {
    phonePrimary: { type: String, default: '' },
    phoneSecondary: { type: String, default: '' },
    emailPrimary: { type: String, default: '' },
    emailSales: { type: String, default: '' },
    addressFull: { type: String, default: '' },
    officeHours: { type: String, default: '' },
    mapEmbedUrl: { type: String, default: '' },
  },
  social: [{
    platform: String,
    url: String,
    icon: String,
    sortOrder: { type: Number, default: 0 },
  }],
  whatsapp: {
    number: { type: String, default: '' },
    enabled: { type: Boolean, default: false },
  },
  analytics: {
    gaMeasurementId: { type: String, default: '' },
    enabled: { type: Boolean, default: false },
  },
  rera: {
    companyRegNumber: { type: String, default: '' },
    disclaimerText: { type: String, default: '' },
  },
  pageSeo: {
    home: {
      title: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },
    about: {
      title: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },
    contact: {
      title: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },
    projects: {
      title: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },
  },
  copyright: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('SiteConfig', siteConfigSchema);
