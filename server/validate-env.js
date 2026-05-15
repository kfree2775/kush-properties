import logger from './logger.js';

const REQUIRED = [
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SESSION_SECRET',
];

export default function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  // ADMIN_SEED: required in production, optional in dev
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_SEED) {
    logger.error('ADMIN_SEED is REQUIRED in production. No predictable defaults allowed.');
    process.exit(1);
  }

  if (!process.env.ADMIN_SEED) {
    logger.warn('ADMIN_SEED not set — will seed default admin (admin@kushproperties.in / changeme123)');
  }

  logger.info('Environment validation passed');
}
