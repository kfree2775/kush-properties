import dns from 'dns';
import mongoose from 'mongoose';
import logger from './logger.js';

// Use Google public DNS — fixes SRV lookup failures on some Windows systems
dns.setServers(['8.8.8.8', '8.8.4.4']);

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;

  try {
    await mongoose.connect(uri, {
      // Mongoose 8 defaults are good — no need for deprecated options
    });
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  // Graceful shutdown
  const gracefulShutdown = async () => {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed via app termination');
      process.exit(0);
    } catch (err) {
      logger.error(`Error closing MongoDB connection: ${err.message}`);
      process.exit(1);
    }
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}
