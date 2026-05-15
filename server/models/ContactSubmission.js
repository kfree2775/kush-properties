import mongoose from 'mongoose';

const contactSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

contactSubmissionSchema.index({ createdAt: -1 });
contactSubmissionSchema.index({ read: 1 });

export default mongoose.model('ContactSubmission', contactSubmissionSchema);
