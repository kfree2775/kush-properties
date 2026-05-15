import mongoose from 'mongoose';

const aboutContentSchema = new mongoose.Schema({
  heroImage: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  heroTagline: { type: String, default: '' },
  storyTitle: { type: String, default: '' },
  storyContent: { type: String, default: '' },
  mission: { type: String, default: '' },
  vision: { type: String, default: '' },
  teamMembers: [{
    name: { type: String, required: true },
    role: { type: String, default: '' },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
  }],
  isPublished: { type: Boolean, default: false },
  draftOverrides: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

export default mongoose.model('AboutContent', aboutContentSchema);
