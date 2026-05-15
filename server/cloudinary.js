import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import logger from './logger.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer with memory storage (buffer) — we'll upload to Cloudinary manually
const storage = multer.memoryStorage();

// File filter — only JPEG, PNG, WebP
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

// Multer upload middleware — max 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * Upload a multer file buffer to Cloudinary.
 * Returns { url, publicId } or throws.
 */
function uploadToCloudinary(fileBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'kushproperties',
      transformation: [
        { quality: 'auto', fetch_format: 'auto', width: 1920, crop: 'limit' },
      ],
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(fileBuffer);
  });
}

// Delete asset from Cloudinary by publicId
async function destroyAsset(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary asset destroyed: ${publicId}`);
  } catch (err) {
    logger.error(`Failed to destroy Cloudinary asset ${publicId}: ${err.message}`);
  }
}

export { cloudinary, upload, uploadToCloudinary, destroyAsset };
