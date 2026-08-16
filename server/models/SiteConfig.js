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
    enabled: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  }],
  uiStrings: {
    aboutHeroOverline: { type: String, default: 'About Us' },
    aboutTeamOverline: { type: String, default: 'Our People' },
    aboutCtaTitle: { type: String, default: 'Ready to Find Your Dream Home?' },
    aboutCtaSubtext: { type: String, default: 'Let our experts guide you through our premium portfolio.' },
    aboutCtaPrimaryText: { type: String, default: 'Explore Projects' },
    aboutCtaPrimaryLink: { type: String, default: '/projects' },
    aboutCtaSecondaryText: { type: String, default: 'Get In Touch' },
    aboutCtaSecondaryLink: { type: String, default: '/contact' },
    contactHeroTitle: { type: String, default: 'Get In Touch' },
    contactHeroSubtext: { type: String, default: "We'd love to hear from you. Reach out for property inquiries, site visits, or any questions." },
    contactFormTitle: { type: String, default: 'Send Us a Message' },
    projectsSectionTitle: { type: String, default: 'Our Portfolio' },
    projectsSectionSubtitle: { type: String, default: 'Our Ongoing Projects' },
    projectsEmptyText: { type: String, default: 'Coming Soon — exciting projects are in the pipeline.' },
    projectsViewAllText: { type: String, default: 'View All Projects →' },
    propertyEnquirePrefix: { type: String, default: 'Enquire About' },
    legalFallbackText: { type: String, default: 'This page is being updated.' },
  },
  whatsapp: {
    phone: { type: String, default: '' },
    message: { type: String, default: '' },
    enabled: { type: Boolean, default: false },
  },
  analytics: {
    ga4Id: { type: String, default: '' },
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
