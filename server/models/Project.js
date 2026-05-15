import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  location: { type: String, default: '' },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  priceRange: { type: String, default: '' },
  priceNumeric: { type: Number, default: null },
  status: { type: String, enum: ['active', 'sold_out', 'coming_soon'], default: 'active' },
  isPublished: { type: Boolean, default: false },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  coverImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  images: [{
    url: String,
    publicId: String,
    caption: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
  }],
  description: { type: String, default: '' },
  amenities: [String],
  specs: {
    area: { type: String, default: '' },
    bedrooms: { type: String, default: '' },
    bathrooms: { type: String, default: '' },
    floors: { type: String, default: '' },
    totalUnits: { type: String, default: '' },
    possessionDate: { type: String, default: '' },
    yearBuilt: { type: String, default: '' },
  },
  reraNumber: { type: String, default: '' },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    ogImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
  },
  sortOrder: { type: Number, default: 0 },
  featuredRank: { type: Number, default: null },
  draftOverrides: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

projectSchema.index({ category: 1, isPublished: 1, sortOrder: 1 });
projectSchema.index({ isPublished: 1, featuredRank: 1 });

export default mongoose.model('Project', projectSchema);
